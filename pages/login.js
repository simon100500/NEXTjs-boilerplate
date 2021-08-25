import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Message from '../components/Message'
import FormContainer from '../components/FormContainer'
import { useForm } from 'react-hook-form'
import { login as loginFun } from '../api/users'
import { useMutation, useQueryClient } from 'react-query'
import { customLocalStorage } from '../utils/customLocalStorage'
import Head from 'next/head'
import { inputEmail, inputPassword } from '../utils/dynamicForm'

const Login = () => {
  const router = useRouter()
  const pathName = router.query.next || '/'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const queryClient = useQueryClient()

  const { isLoading, isError, error, mutateAsync } = useMutation(loginFun, {
    retry: 0,
    staleTime: 100000,
    onSuccess: (data) => {
      reset()
      queryClient.setQueryData('userInfo', data)
      router.push(pathName)
    },
  })

  useEffect(() => {
    customLocalStorage() && customLocalStorage().userInfo && router.push('/')
  }, [router])

  const submitHandler = async (data) => {
    mutateAsync(data)
  }

  return (
    <FormContainer>
      <Head>
        <title>Login</title>
        <meta property='og:title' content='Login' key='title' />
      </Head>
      <h3 className=''>Sign In</h3>
      {isError && <Message variant='danger'>{error}</Message>}

      <form onSubmit={handleSubmit(submitHandler)}>
        {inputEmail({ register, errors, name: 'email' })}
        {inputPassword({
          register,
          errors,
          name: 'password',
        })}

        <button type='submit' className='btn btn-primary ' disabled={isLoading}>
          {isLoading ? (
            <span className='spinner-border spinner-border-sm' />
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      <div className='row pt-3'>
        <div className='col'>
          <Link href='/forgot'>
            <a className='ps-1'> Forgot Password</a>
          </Link>
        </div>
      </div>
      <div className='row '>
        <div className='col'>
          New Member?
          <Link href='/register'>
            <a className='ps-1'>Register</a>
          </Link>
        </div>
      </div>
    </FormContainer>
  )
}

export default Login
