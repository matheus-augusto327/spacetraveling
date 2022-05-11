import Link from "next/link"
import styles from "./header.module.scss"

export default function Header() {
  return (
    <div className={styles.container}>
      <Link href='/'>
        <a>
          <img src="/images/Logo.svg" alt="logo" className={styles.logo} />
        </a>
      </Link>
    </div>
  )
}
