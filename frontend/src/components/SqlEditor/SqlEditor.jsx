"use client"

import { useState } from "react"
import styles from './SqlEditor.module.scss';
import { Editor } from "@monaco-editor/react";
import { useSelector } from "react-redux";

// const { Editor } = require("@monaco-editor/react")

const SqlEditor = ({ id }) => {

    const [query, setQuery] = useState('');
    const [queryOutput, setQueryOutput] = useState([]);
    const [error, setError] = useState('');
    const [verdict, setVerdict] = useState(false);

    const user = useSelector((state) => state.auth.user);

    const runQuery = async () => {
        // console.log(query, 'id: ', id);
        // setResult('Something')
        console.log('This is id: ', id)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query/run`, 
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    assignmentId: id, 
                    sql: query, 
                    userId: user.id
                })
            }
        );
        const response = await res.json();
        if (response.success) {
            setVerdict(response.verdict.correct);
            setQueryOutput(response.verdict.queryOutput);
        } else {
            setError(response.message);
        }
    }

    return (
        <div className={styles.sqlEditor}>
            <div className={styles.editorPart}>
                <div className={styles.buttons}>
                    <button className={styles.format}>Format</button>
                    <button 
                        className={styles.runBtn}
                        onClick={runQuery}
                    >
                        Run SQL
                    </button>
                    <button className={styles.submit}>Submit</button>
                </div>

                <Editor 
                height='50vh'
                defaultLanguage="sql"
                defaultValue=""
                theme="vs-light"
                onChange={(value) => setQuery(value) }
                />
            </div>

            
            {/* Output Part */}
            <div className={styles.output}>
                <div className={styles.outputHead}>
                    <p>QUERY OUTPUT</p>
                    <>
                    {error ? (
                        <p className={styles.error}>{error}</p>
                    ) : (
                        <div>
                            {verdict ? (
                                <p className={styles.success}>Success</p>
                            ) : (
                                <p className={styles.failure}>Failed</p>
                            )}
                        </div>
                    )}
                    </>
                </div>
                {queryOutput && (
                    // <div className={styles.result}>
                    //     {queryOutput.map(row => (
                            <table>
                                <thead>
                                    <tr>
                                    {queryOutput[0] && Object.keys(queryOutput[0]).map((key) => (
                                        <th key={key}>{key}</th>
                                    ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {queryOutput.map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((value, j) => (
                                        <td key={j}>{value}</td>
                                        ))}
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                    //     ))}
                    // </div>
                )}
            </div>
        </div>
    )
}

export default SqlEditor;
