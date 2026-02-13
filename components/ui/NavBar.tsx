import Link from 'next/link'
import IconLink from './IconLink'

const NavBar = () => {
  return (
    <div className='flex items-center justify-between w-full py-4'>
      <div className='flex items-center'>
        <IconLink iconName='instagram' href='https://www.instagram.com' label='Instagram' className="text-blue-600 hover:text-blue-300" />
        <IconLink iconName='email' href='mailto:propeltutoringyeg@gmail.com' label='Email' className="text-blue-600 hover:text-blue-300" />
      </div>
      <div className='flex items-center gap-4'>
        <Link className="text-blue-600 hover:text-blue-300 p-2 transition-transform duration-200 hover:scale-110"  href="/">HOME</Link>
        <Link className="text-blue-600 hover:text-blue-300 p-2 transition-transform duration-200 hover:scale-110"  href="/about">ABOUT</Link>
        <Link className="text-blue-600 hover:text-blue-300 p-2 transition-transform duration-200 hover:scale-110"  href="/signup">SIGN UP</Link>
        <Link className="text-blue-600 hover:text-blue-300 p-2 transition-transform duration-200 hover:scale-110"  href="/support">SUPPORT</Link>
      </div>
    </div>
  )
}

export default NavBar

// TODO:
// - use global css file to dictate default: colours, fonts, textsizes, etc
// - use css modules per component where needed for extra functionality