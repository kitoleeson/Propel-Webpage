import Link from 'next/link'
import React from 'react'

const NavBar = () => {
  return (
    <div>
      <Link className="text-blue-600 px-4"  href="/about">about</Link>
      <Link className="text-blue-600 px-4"  href="/signup">signup</Link>
      <Link className="text-blue-600 px-4"  href="/support">support</Link>
    </div>
  )
}

export default NavBar