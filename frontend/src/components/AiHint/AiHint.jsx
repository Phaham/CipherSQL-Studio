'use client'

import { useState } from "react";
import styles from './AiHint.module.scss';

const AiHint = ({id}) => {

    const [hint, setHint] = useState('');

    const handleHint = async () => {
        // console.log('This is problem id: ', id)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hints`, 
            {
                headers: {
                    "Content-Type": "application/json"
                },
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    assignmentId: id
                })
            }
        )
         if (res.ok) {
            const response = await res.json();
            if(response.success) {
                setHint(response.hint);
            }
         }
        // setHint('This is AI hint for you')
    }

    return (
        <div className={styles.hint}>
            <button
                onClick={handleHint}
            >
                AI Hint
            </button>

            {hint && (
                <p>{hint}</p>
            )}
        </div>
    )
}

export default AiHint;