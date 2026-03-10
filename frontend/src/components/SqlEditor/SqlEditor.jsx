"use client"

import { useState } from "react"
import styles from './SqlEditor.module.scss';

const { Editor } = require("@monaco-editor/react")

const SqlEditor = ({ id }) => {

    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);

    const runQuery = async () => {
        console.log(query, 'id: ', id);
        setResult('Something')
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/run-query`, 
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: {
        //             id,
        //             query
        //         }
        //     }
        // );
        // if (res.ok) {
        //     const data = await res.json();
        //     setResult(data);
        // } else {
        //     console.log("Request failed")
        // }
    }

    return (
        <div className={styles.sqlEditor}>
            <button 
                className={styles.runBtn}
                onClick={runQuery}
            >
                Run Query
            </button>

            <Editor 
            height='50vh'
            defaultLanguage="sql"
            defaultValue="// Write your query here"
            theme="vs-dark"
            onChange={(value) => setQuery(value) }
            />

            
            {/* Output Part */}
            <div className={styles.output}>
                <h3>Output:</h3>
                {result && (
                    <div>
                        <div className={styles.output_left}>
                            <h4>Your Output</h4>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Non, dignissimos ipsam! Magnam, beatae autem esse reiciendis laborum, placeat omnis unde est error minus, numquam cumque repellat rerum. Sapiente, quam quasi!</p>
                        </div>
                        <div className={styles.output_right}>
                            <h4>Expected Output</h4>
                            <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Non repudiandae quasi sequi tempore aut rerum ea velit amet fugit iste eius corporis, et quisquam rem cumque? Rem sunt unde fugiat.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SqlEditor;
