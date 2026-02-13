import NavBar from '@/components/ui/NavBar'
import React from 'react'

const AboutPage = () => {
  return (
    <div>
      <NavBar />
      <h1>About Page</h1>
      <p>this page will hold a little information about who we are as collective tutors, as well as more personalized information for each tutor so that students may choose a tutor who they feel will help them the best. each tutor will have their own card with a picture and information about them, as well as whether or not they are currently taking clients. all information will be pulled from the database, and the page will be built dynamically based off its entries.</p>
    </div>
  )
}

export default AboutPage