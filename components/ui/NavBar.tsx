import Link from 'next/link'

const NavBar = () => {
  return (
    <div className='flex items-center justify-between w-full py-4'>
    <div className='flex items-center gap-4'>
      <Link className="text-blue-600 px-4"  href="/about">ABOUT</Link>
      <Link className="text-blue-600 px-4"  href="/signup">SIGN UP</Link>
      <Link className="text-blue-600 px-4"  href="/support">SUPPORT</Link>
    </div>
    <div className='flex items-center gap-4'>
      <Link className="text-blue-600 hover:text-blue-300 px-4"  href="/">HOME</Link>
      <Link className="text-blue-600 hover:text-blue-300 px-4"  href="/about">ABOUT</Link>
      <Link className="text-blue-600 hover:text-blue-300 px-4"  href="/signup">SIGN UP</Link>
      <Link className="text-blue-600 hover:text-blue-300 px-4"  href="/support">SUPPORT</Link>
    </div>
    </div>
  )
}

export default NavBar

// TODO:
// - use global css file to dictate default: colours, fonts, textsizes, etc
// - use css modules per component where needed for extra functionality