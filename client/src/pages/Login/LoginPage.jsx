import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(s => s.auth);
    const [form, setForm] = useState({ email: '', password: '' });

    const submit = async (e) => {
        e.preventDefault();
        const res = await dispatch(login(form));
        if (res.meta.requestStatus === 'fulfilled') navigate('/me');
    };

    return (
        <div>
            <h3>התחברות</h3>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={submit}>
                <input placeholder="Email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <input placeholder="Password" type="password" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button disabled={loading}>{loading ? '...' : 'Login'}</button>
            </form>
        </div>
    );
}
