import Link from 'next/link';
import styles from './assignments.module.scss'

const Assignments = async () => {

    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
    //     next: { revalidate: 3600 }
    // } )
    // // const assignments = res.json();

    const assignments = [
        {
          "id": 1,
          "title": "Find All Users",
          "difficulty": "Easy"
        },
        {
          "id": 2,
          "title": "Orders Above 100",
          "difficulty": "Medium"
        },
        {
          "id": 3,
          "title": "Find All Users",
          "difficulty": "Easy"
        },
        {
          "id": 4,
          "title": "Orders Above 100",
          "difficulty": "Medium"
        },
        {
          "id": 5,
          "title": "Find All Users",
          "difficulty": "Easy"
        },
        {
          "id": 6,
          "title": "Orders Above 100",
          "difficulty": "Medium"
        },
        {
          "id": 7,
          "title": "Find All Users",
          "difficulty": "Easy"
        },
        {
          "id": 8,
          "title": "Orders Above 100",
          "difficulty": "Medium"
        }
      ]

    return (
        <div className={styles.container}>
          <div className={styles.assignments}>
            <div className={styles.assignments_th}>
              <p>PROBLEM NAME</p>
              <p>DIFFICULTY</p>
            </div>
            { assignments.map(a => (
                <div key={a.id} className={styles.assignments_row} >
                    <Link className={styles.assignments_link} href={`/assignments/${a.id}`}>{ a.title }</Link>
                    <p className={styles.assignments_dif}>{ a.difficulty }</p>
                </div>
            ))}
          </div>
        </div>
    )
}

export default Assignments;