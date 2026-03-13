import SqlEditor from "@/components/SqlEditor/SqlEditor";
import styles from './assignment.module.scss';
import AiHint from "@/components/AiHint/AiHint";

const AssignmentPage = async ({ params }) => {

    const { id } = await params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/${id}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );
    const response = await res.json();
    const assignment = response.data;

    return (
        <div className={styles.assignment}>
            <section className={styles.assignment_left}>
                {/* question section - left side */}
                <h3>{assignment.title}</h3>
                <h4>Question:</h4>
                <p>{assignment.question}</p>
                {assignment.sampleTables.map(table => (
                    <div key={table.tableName}>
                        <p>Table Name: <b>{ table.tableName }</b></p>
                        <table>
                            <thead>
                                <tr>
                                    {table.columns.map(col => (
                                        <th key={col.columnName}>{col.columnName}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.rows.map(row => (
                                    <tr key={row.id}>
                                        {Object.values(row).map((val, i) => (
                                            <td key={i}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <AiHint />
                    </div>
                ))}
            </section>
            <section className={styles.assignment_right}>
                {/* right part */}
                <SqlEditor id={ id }/>
            </section>
        </div>
    )
}

export default AssignmentPage;