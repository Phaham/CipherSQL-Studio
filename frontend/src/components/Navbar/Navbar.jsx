'use client'
import Link from "next/link";
import styles from "./Navbar.module.scss";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

const Navbar = () => {

    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const user = useSelector((state) => state.auth.user);

    const handleLogout = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            )
            const response = await res.json();
            if (response.success) {
                alert(response.message);
                dispatch(logout());
            } else {
                alert('Logout Failed, try again');
                console.log(response.message);
            }
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    return (
        <nav className={styles.navbar}>
            <Link href='/assignments' className={styles.logo}>CipherSchools</Link>
            <div>
                <div className={styles.desktopAuth}>
                    {user ? (
                        <>
                            <p>Hello {user.firstName}</p>
                            <button
                                onClick={handleLogout}
                            >Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href='/login'>Login</Link>
                            <Link href='/signup'>Register</Link>
                        </>
                    )}
                    
                </div>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setOpen(!open)}
                >
                    <img src="/Vector.png" alt="Toggle Menu Button" />
                </button>
            </div>  
            {open && (
                <div className={styles.mobileMenu}>
                    <Link href='/login' onClick={() => setOpen(!open)}>Login</Link>
                    <Link href='/signup' onClick={() => setOpen(!open)}>Register</Link>
                </div>
            )}
        </nav>
    )
}

export default Navbar;