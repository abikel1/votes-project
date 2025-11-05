import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../slices/authSlice';

export default function RegisterPage() {
    const dispatch = useDispatch();
    const { loading, error, registeredOk } = useSelector(s => s.auth);
    const [form, setForm] = useState({ name: '', email: '', password: '', address: '', phone: '' });

    const submit = (e) => {
        e.preventDefault();
        dispatch(register(form));
    };

    return (
        <div>
            <h3>הרשמה</h3>
            {registeredOk && <div style={{ color: 'green' }}>נרשמת בהצלחה! עכשיו התחברי.</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={submit}>
                <input placeholder="Name" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input placeholder="Email" onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <input placeholder="Password" type="password" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <input placeholder="Address" onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                <input placeholder="Phone" onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <button disabled={loading}>{loading ? '...' : 'Create account'}</button>
            </form>
        </div>
    );
}
