'use client'

import { useState } from "react";
import styles from './AiHint.module.scss';

const AiHint = () => {

    const [hint, setHint] = useState('');

    const handleHint = async () => {
        // const res = await fetch(`${NEXT_PUBLIC_API_URL}/hints`, 
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json' 
        //         }
        //     }
        // )
        //  if (resizeBy.ok) {
        //     const data = await res.json();
        //     setHint(data)
        //  }
        setHint('This is AI hint for you')
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