'use client'

import { useState } from "react";
import styles from './signup.module.scss';
import Link from "next/link";
import { useRouter } from "next/navigation";

const Signup = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, 
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    mobileNo,
                    password
                })
            }
        )
        const response = await res.json();
        if(response.success) {
            //  add state to redux
            alert('User registered successfully, Login now');
            router.push('/login');
        } else {
            setError(response.message);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <p className={styles.lapHeading}>Register to CipherSchools</p>
                
                <div className={`${styles.mobScreen} ${styles.mobHeading}`}>
                    <p className={styles.welcome}>Welcome user!👋🏻 </p>
                    <p>Sign-Up and begin with your coding!</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.signup}>
                    <input 
                        type="text"
                        placeholder="First Name:"
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <input 
                        type="text"
                        placeholder="Last Name:"
                        onChange={e => setLastName(e.target.value)}
                    />
                    <input 
                        type="email"
                        placeholder="Email ID:"
                        className={styles.full}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        type="number"
                        placeholder="Mobile No:"
                        onChange={e => setMobileNo(e.target.value)}
                    />
                    <input 
                        type="password"
                        placeholder="Password:"

                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className={` ${styles.mobScreen} ${styles.full} ${styles.check}`}>
                        <input type="checkbox"></input>
                        <p>Receive our latest blogs full tips and insights.</p>
                    </div>
                    <div className={` ${styles.mobScreen} ${styles.full} ${styles.check}`}>
                        <input type="checkbox"></input>
                        <p>Get our exclusive newsletters for updates and offers.</p>
                    </div>
                    <button type="submit" className={styles.full}>Sign-Up</button>
                </form>
                <p>Already have an account? <Link href='/login'>Sign-in Now!</Link></p>
                {error && <p className={styles.error}>{error}</p>}
            </div>
            <div className={styles.right}>
                <img src="/laptop.png" />
            </div>
        </div>

    )
}

export default Signup;