import Link from 'next/link'
import IconLink from './IconLink'

const NavBar = () => {
  return (
    <div className='flex items-center justify-between w-full p-2'>
      <div className='flex items-center'>
        <IconLink iconName='instagram' href='https://www.instagram.com' label='Instagram' className="nav-icon" />
        <IconLink iconName='email' href='mailto:propeltutoringyeg@gmail.com' label='Email' className="nav-icon" />
      </div>
      <div className='flex items-center gap-4'>
        <Link className="nav-link"  href="/">HOME</Link>
        <Link className="nav-link"  href="/about">ABOUT</Link>
        <Link className="nav-link"  href="/signup">SIGN UP</Link>
        <Link className="nav-link"  href="/support">SUPPORT</Link>
      </div>
    </div>
  )
}

export default NavBar

// TODO:
// - use global css file to dictate default: colours, fonts, textsizes, etc
// - use css modules per component where needed for extra functionality