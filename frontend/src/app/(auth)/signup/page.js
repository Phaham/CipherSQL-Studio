'use client'

import { useState } from "react";
import styles from './signup.module.scss';

const Signup = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCpassword] = useState('');

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <img src="/coder-img.png" />
            </div>
            <form className={styles.signup}>
                <input 
                    type="text"
                    placeholder="First Name"
                />
                <input 
                    type="text"
                    placeholder="Last Name"
                />
                <input 
                    type="email"
                    placeholder="Email"
                />
                <input 
                    type="password"
                    placeholder="Password"
                />
                <input 
                    type="password"
                    placeholder="Confirm Password"
                />
                <button>Signup</button>
            </form>
        </div>

    )
}

export default Signup;