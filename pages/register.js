import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Message from '../components/Message'
import FormContainer from '../components/FormContainer'

import { registerUser } from '../api/users'
import { useMutation } from 'react-query'

import { useForm } from 'react-hook-form'
import { customLocalStorage } from '../utils/customLocalStorage'
import Head from 'next/head'
import { inputEmail, inputPassword, inputText } from '../utils/dynamicForm'

const Register = () => {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      admin: false,
      user: false,
    },
  })

  const { isLoading, isError, error, isSuccess, mutateAsync } = useMutation(
    'registerUser',
    registerUser,
    {
      retry: 0,
      onSuccess: () => {
        reset()
        router.push('/')
      },
    }
  )

  useEffect(() => {
    customLocalStorage() && customLocalStorage().userInfo && router.push('/')
  }, [router])

  const submitHandler = (data) => {
    mutateAsync(data)
  }
  return (
    <FormContainer>
      <Head>
        <title>Sign up</title>
        <meta property='og:title' content='Signup' key='title' />
      </Head>
      <h3 className=''>Sign Up</h3>
      {isSuccess && (
        <Message variant='success'>User has registered successfully</Message>
      )}

      {isError && <Message variant='danger'>{error}</Message>}
      <form onSubmit={handleSubmit(submitHandler)}>
        {inputText({ register, errors, name: 'name' })}
        {inputEmail({ register, errors, name: 'email' })}
        {inputPassword({
          register,
          errors,
          name: 'password',
          isRequired: true,
          minLength: true,
        })}

        {inputPassword({
          register,
          errors,
          watch,
          name: 'confirmPassword',
          screenName: 'confirm password',
          validate: true,
          minLength: true,
        })}

        <button type='submit' className='btn btn-primary ' disabled={isLoading}>
          {isLoading ? (
            <span className='spinner-border spinner-border-sm' />
          ) : (
            'Sign Up'
          )}
        </button>
      </form>

      <div className='row py-3'>
        <div className='col'>
          Have an Account?
          <Link href='/login'>
            <a className='ps-1'>Login </a>
          </Link>
        </div>
      </div>
    </FormContainer>
  )
}

export default Register
