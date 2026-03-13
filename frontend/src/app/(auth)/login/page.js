'use client'

import { useState } from "react";
import styles from './login.module.scss';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(email)
        // console.log(password)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, 
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        )
        const response = await res.json();
        if(response.success) {
            //  add state to redux
            dispatch(login({
                userId: response.user.id,
                firstName: response.user.firstName,
                email: response.user.email
            }));

            router.push('/assignments')
        } else {
            setError(response.message);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <p className={styles.lapHeading}>Login to CipherSchools</p>
                    
                <div className={`${styles.mobScreen} ${styles.mobHeading}`}>
                    <p className={styles.welcome}>Welcome user!👋🏻 </p>
                    <p>Sign-In and begin with your coding!</p>
                </div>
                <form onSubmit={handleSubmit} className={styles.login}>
                    <input 
                        type="email"
                        placeholder="Email ID"
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                    />
                    <p>Forgot Password?</p>
                    <button className={styles.full} type="submit">Sign-In</button>
                </form>
                <p>Don't have an account? <Link href='/signup'>Get Started!</Link></p>
                {error && <p className={styles.error}>{error}</p>}
            </div>
            <div className={styles.right}>
                <img src="/laptop.png" />
            </div>
            
        </div>

    )
}

export default Login;