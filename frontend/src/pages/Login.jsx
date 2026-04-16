import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if(name.trim()) onLogin(name.trim());
  };

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #fce7f3, #e0e7ff)'}}>
      <form onSubmit={submit} className="chart-card" style={{width: '90%', maxWidth: '400px', textAlign: 'center'}}>
        <div style={{background: '#8b5cf6', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'white'}}>
          <Leaf size={32} />
        </div>
        <h1 style={{fontSize: '2.4rem', marginBottom: '8px', color: '#1e293b'}}>Welcome Back</h1>
        <p style={{color: '#94a3b8', marginBottom: '32px'}}>Your personal habit tracking journey starts here.</p>
        
        <input 
          type="text" 
          placeholder="Enter your name" 
          className="input-text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button className="btn-submit" type="submit" style={{background: '#8b5cf6'}}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default Login;
