from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
from bson import ObjectId
from dotenv import load_dotenv

import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv() # Load variables from .env

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# More robust CORS for production
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

MONGO_URI = os.environ.get('MONGO_URI')
if not MONGO_URI:
    logger.warning("MONGO_URI not found in environment variables. Using localhost default.")
    MONGO_URI = 'mongodb://localhost:27017/'

db_connected = False
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client['habit_tracker_db']
    habits_collection = db['habits']
    users_collection = db['users']
    # Trigger a connection check
    client.admin.command('ping')
    db_connected = True
    logger.info("Successfully connected to MongoDB")
except Exception as e:
    logger.error(f"CRITICAL: Could not connect to MongoDB: {e}")
    db_connected = False

def serialize_doc(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "database": "connected" if client.server_info() else "disconnected"}), 200

def get_or_create_user(username):
    if not username:
        username = "default_user"
    user = users_collection.find_one({"user_name": username})
    if not user:
        user = {
            "user_name": username,
            "xp": 0,
            "level": 1,
            "hp": 100,
            "unlockedThemes": ["Light Pastel"],
            "badges": []
        }
        res = users_collection.insert_one(user)
        user['_id'] = str(res.inserted_id)
        return user
    return serialize_doc(user)

def check_badge_unlocks(user_name):
    user = users_collection.find_one({"user_name": user_name})
    if not user: return
    pipeline = [
        {"$match": {"user_name": user_name}},
        {"$sort": {"date": -1}},
        {"$limit": 100}
    ]
    entries = list(habits_collection.aggregate(pipeline))
    streak = 0
    for e in entries:
        if e.get("completion_percentage", 0) > 0: streak += 1
        else: break
        
    badges = user.get("badges", [])
    badge_names = [b["badgeName"] for b in badges]
    new_badges = []
    
    if streak >= 7 and "7 Day Streak! 🔥" not in badge_names:
        new_badges.append({"badgeName": "7 Day Streak! 🔥", "icon": "🔥", "earnedAt": datetime.now().isoformat()})
    if streak >= 30 and "30 Day Champion 🏆" not in badge_names:
        new_badges.append({"badgeName": "30 Day Champion 🏆", "icon": "🏆", "earnedAt": datetime.now().isoformat()})
    if streak >= 100 and "100 Day Master 👑" not in badge_names:
        new_badges.append({"badgeName": "100 Day Master 👑", "icon": "👑", "earnedAt": datetime.now().isoformat()})
        
    if new_badges:
        users_collection.update_one({"user_name": user_name}, {"$push": {"badges": {"$each": new_badges}}})

@app.route('/api/user/<username>', methods=['GET'])
def get_user_status(username):
    user = get_or_create_user(username)
    return jsonify(user), 200

@app.route('/api/user/sync', methods=['POST'])
def sync_user():
    data = request.json
    username = data.get("user_name")
    if not username: return jsonify({"error": "User required"}), 400
    user = get_or_create_user(username)
    
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    yesterday_entry = habits_collection.find_one({"user_name": username, "date": yesterday})
    
    hp_loss = 0
    if yesterday_entry:
        for h in yesterday_entry.get("habits", []):
            if h.get("status") != "Done":
                hp_loss += 10
                
    if hp_loss > 0:
        new_hp = user['hp'] - hp_loss
        new_level = user['level']
        if new_hp <= 0:
            new_hp = 100
            new_level = max(1, new_level - 1)
        users_collection.update_one({"user_name": username}, {"$set": {"hp": new_hp, "level": new_level}})
    
    updated_user = get_or_create_user(username)
    return jsonify({"message": "Synced", "user": updated_user}), 200

@app.route('/api/habits', methods=['POST'])
def add_habits_entry():
    if not db_connected:
        return jsonify({"error": "Backend is live but cannot connect to Database. Check your MONGO_URI and MongoDB whitelisting."}), 503
    try:
        data = request.json
        logger.info(f"Received request to add habit: {data}")
        
        user_name = data.get('user_name', 'default_user')
        date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        habits_list = data.get('habits', [])

        if not habits_list:
             return jsonify({"error": "Habit list is empty"}), 400

        formatted_habits = []
        for h in habits_list:
            formatted_habits.append({
                "habit_name": h if isinstance(h, str) else h.get('name', ''),
                "status": "Not Done",
                "created_at": datetime.now().isoformat(),
                "photos": []
            })
        
        existing = habits_collection.find_one({"user_name": user_name, "date": date_str})
        if existing:
            habits_collection.update_one(
                {"_id": existing["_id"]},
                {"$push": {"habits": {"$each": formatted_habits}}}
            )
            logger.info(f"Appended habits to existing entry for {user_name} on {date_str}")
            return jsonify({"message": "Habits appended"}), 200
        
        entry = {
            "user_name": user_name,
            "date": date_str,
            "habits": formatted_habits,
            "total_habits": len(formatted_habits),
            "completed_count": 0,
            "completion_percentage": 0.0
        }
        result = habits_collection.insert_one(entry)
        entry['_id'] = str(result.inserted_id)
        logger.info(f"Created new habits entry for {user_name} on {date_str}")
        return jsonify({"message": "Habits entry created", "entry": entry}), 201
    except Exception as e:
        logger.error(f"Error adding habits: {e}")
        return jsonify({"error": "Internal server error occurred while adding habit"}), 500

@app.route('/api/habits', methods=['GET'])
def get_habits():
    date_filter = request.args.get('date')
    search_query = request.args.get('search')
    query = {}
    if date_filter: query['date'] = date_filter
        
    entries = list(habits_collection.find(query).sort('date', -1))
    
    if search_query:
        search_lower = search_query.lower()
        for entry in entries:
            entry['habits'] = [h for h in entry['habits'] if search_lower in h['habit_name'].lower()]
            
    return jsonify([serialize_doc(doc) for doc in entries]), 200

@app.route('/api/habits/<entry_id>/habit/<habit_name>', methods=['PUT'])
def update_habit_status(entry_id, habit_name):
    data = request.json
    new_status = data.get('status')
    if not new_status: return jsonify({"error": "Status is required"}), 400
        
    try:
        entry = habits_collection.find_one({"_id": ObjectId(entry_id)})
        if not entry: return jsonify({"error": "Entry not found"}), 404
            
        habits = entry.get('habits', [])
        completed_count = 0
        just_completed = False
        user_name = entry.get('user_name')
        
        for h in habits:
            if h['habit_name'] == habit_name:
                if h.get('status') != "Done" and new_status == "Done":
                    just_completed = True
                h['status'] = new_status
            if h.get('status') == "Done":
                completed_count += 1
                
        total_habits = len(habits)
        completion_percentage = (completed_count / total_habits * 100) if total_habits > 0 else 0
        
        habits_collection.update_one(
            {"_id": ObjectId(entry_id)},
            {"$set": {
                "habits": habits,
                "completed_count": completed_count,
                "completion_percentage": round(completion_percentage, 2)
            }}
        )
        
        leveled_up = False
        new_level = 1
        # Calculate gamification if user checked off a task
        if just_completed and user_name:
            user = get_or_create_user(user_name)
            new_xp = user['xp'] + 10
            new_level = user['level']
            new_hp = user['hp']
            
            level_threshold = new_level * 100
            if new_xp >= level_threshold:
                new_level += 1
                new_xp = new_xp - level_threshold
                new_hp = 100 # Heal on level up
                leveled_up = True
                
                themes = user.get("unlockedThemes", [])
                if new_level == 5 and "Midnight RPG" not in themes: themes.append("Midnight RPG")
                users_collection.update_one({"user_name": user_name}, {"$set": {"unlockedThemes": themes}})
                
            users_collection.update_one(
                {"user_name": user_name}, 
                {"$set": {"xp": new_xp, "level": new_level, "hp": new_hp}}
            )
            check_badge_unlocks(user_name)
            
        return jsonify({"message": "Habit updated successfully", "leveledUp": leveled_up, "level": new_level}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/habits/<entry_id>/habit/<habit_name>', methods=['DELETE'])
def delete_individual_habit(entry_id, habit_name):
    try:
        entry = habits_collection.find_one({"_id": ObjectId(entry_id)})
        if not entry: return jsonify({"error": "Entry not found"}), 404
        
        # Filter out the habit
        habits = [h for h in entry.get('habits', []) if h['habit_name'] != habit_name]
        
        if not habits:
            # If no habits left, delete entire entry
            habits_collection.delete_one({"_id": ObjectId(entry_id)})
            return jsonify({"message": "Entire entry deleted as no habits remained"}), 200
        
        # Recalculate stats
        completed_count = sum(1 for h in habits if h.get('status') == 'Done')
        total_habits = len(habits)
        completion_percentage = round((completed_count / total_habits * 100), 2)
        
        habits_collection.update_one(
            {"_id": ObjectId(entry_id)},
            {"$set": {
                "habits": habits,
                "total_habits": total_habits,
                "completed_count": completed_count,
                "completion_percentage": completion_percentage
            }}
        )
        return jsonify({"message": "Habit removed from routine"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/habits/<entry_id>', methods=['PUT'])
def update_full_routine(entry_id):
    data = request.json
    new_habit_names = data.get('habits', [])
    if not new_habit_names: return jsonify({"error": "Habits list required"}), 400
    
    try:
        entry = habits_collection.find_one({"_id": ObjectId(entry_id)})
        if not entry: return jsonify({"error": "Entry not found"}), 404
        
        old_habits = {h['habit_name']: h for h in entry.get('habits', [])}
        updated_habits = []
        
        for name in new_habit_names:
            if name in old_habits:
                updated_habits.append(old_habits[name])
            else:
                updated_habits.append({
                    "habit_name": name,
                    "status": "Not Done",
                    "created_at": datetime.now().isoformat(),
                    "photos": []
                })
        
        completed_count = sum(1 for h in updated_habits if h.get('status') == 'Done')
        total_habits = len(updated_habits)
        completion_percentage = round((completed_count / total_habits * 100), 2)
        
        habits_collection.update_one(
            {"_id": ObjectId(entry_id)},
            {"$set": {
                "habits": updated_habits,
                "total_habits": total_habits,
                "completed_count": completed_count,
                "completion_percentage": completion_percentage
            }}
        )
        return jsonify({"message": "Routine updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/habits/<entry_id>/habit/<habit_name>/photo', methods=['POST'])
def update_habit_photo(entry_id, habit_name):
    data = request.json
    photo_b64 = data.get('photo')
    if not photo_b64: return jsonify({"error": "Photo is required"}), 400
    
    try:
        entry = habits_collection.find_one({"_id": ObjectId(entry_id)})
        if not entry: return jsonify({"error": "Entry not found"}), 404
        
        habits = entry.get('habits', [])
        for h in habits:
            if h['habit_name'] == habit_name:
                if 'photos' not in h: h['photos'] = []
                h['photos'].append({
                    "timestamp": datetime.now().isoformat(),
                    "image": photo_b64
                })
        
        habits_collection.update_one({"_id": ObjectId(entry_id)}, {"$set": {"habits": habits}})
        return jsonify({"message": "Photo uploaded safely!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/habits/<entry_id>/habit/<habit_name>/photo', methods=['DELETE'])
def delete_habit_photo(entry_id, habit_name):
    timestamp = request.args.get('timestamp')
    if not timestamp: return jsonify({"error": "Timestamp required"}), 400
    
    try:
        entry = habits_collection.find_one({"_id": ObjectId(entry_id)})
        if not entry: return jsonify({"error": "Entry not found"}), 404
        
        habits = entry.get('habits', [])
        for h in habits:
            if h['habit_name'] == habit_name:
                if 'photos' in h:
                    h['photos'] = [p for p in h['photos'] if p['timestamp'] != timestamp]
        
        habits_collection.update_one({"_id": ObjectId(entry_id)}, {"$set": {"habits": habits}})
        return jsonify({"message": "Photo deleted!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/habits/<entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    try:
        result = habits_collection.delete_one({"_id": ObjectId(entry_id)})
        if result.deleted_count > 0:
            return jsonify({"message": "Entry deleted"}), 200
        return jsonify({"error": "Entry not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/habits/stats', methods=['GET'])
def get_stats():
    pipeline = [
        {"$sort": {"date": 1}},
        {"$group": {
            "_id": "$user_name",
            "total_completed": {"$sum": "$completed_count"},
            "total_habits": {"$sum": "$total_habits"},
            "entries_count": {"$sum": 1},
            "average_completion": {"$avg": "$completion_percentage"}
        }}
    ]
    stats = list(habits_collection.aggregate(pipeline))
    entries = list(habits_collection.find().sort('date', -1).limit(30))
    streak = 0
    if entries:
        for e in entries:
            if e.get("completion_percentage", 0) > 0: streak += 1
            else: break

    return jsonify({
        "aggregations": stats,
        "current_streak": streak,
        "recent_entries": [serialize_doc(d) for d in entries[:15]] 
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
