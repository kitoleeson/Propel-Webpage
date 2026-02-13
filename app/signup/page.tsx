import NavBar from '@/components/ui/NavBar'
import React from 'react'

const SignupPage = () => {
  return (
    <div>
      <NavBar />
      <h1>Signup Page</h1>
      <p>this page will host the signup form for incoming clients to the company. it will take in all the information we need from them, add their profiles to the database, and allow them to choose a tutor. on submission, it will email me a summary of their answers so that i can ensure everything is correct and correctly assign them their tutor. it will also automatically send them an email at their provided email holding the client agreement contract.</p>
      <p>*insert client intake form*</p>
    </div>
  )
}

export default SignupPage