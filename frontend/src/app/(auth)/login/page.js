'use client'

import { useState } from "react";
import styles from './login.module.scss';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <img src="/coder-img.png" />
            </div>
            <form className={styles.login}>
                <input 
                    type="email"
                    placeholder="Email"
                />
                <input 
                    type="password"
                    placeholder="Password"
                />
                <button>Login</button>
            </form>
        </div>

    )
}

export default Login;