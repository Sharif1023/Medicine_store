import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';

import http from '../api/http';
import {useAuthStore} from '../store/auth';
import {AuthShell} from './Login';


export default function Register(){

  const [f,setF]=useState({
    firstName:'',
    lastName:'',
    email:'',
    phone:'',
    password:''
  });

  const [confirmPassword,setConfirmPassword]=useState('');

  const [err,setErr]=useState('');

  const [busy,setBusy]=useState(false);

  const setSession=useAuthStore(
    s=>s.setSession
  );

  const nav=useNavigate();


  /* =========================================
     INPUT CHANGE
     ========================================= */

  const change=(key,value)=>{

    setF(previous=>({
      ...previous,
      [key]:value
    }));

    if(err){
      setErr('');
    }

  };


  /* =========================================
     REGISTER
     ========================================= */

  const submit=async(e)=>{

    e.preventDefault();

    if(busy){
      return;
    }


    setErr('');


    /* =====================================
       BASIC VALIDATION
       ===================================== */

    if(!f.firstName.trim()){

      setErr(
        'Please enter your first name.'
      );

      return;

    }


    if(!f.lastName.trim()){

      setErr(
        'Please enter your last name.'
      );

      return;

    }


    if(!f.email.trim()){

      setErr(
        'Please enter your email address.'
      );

      return;

    }


    const emailRegex=
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(
      !emailRegex.test(
        f.email.trim()
      )
    ){

      setErr(
        'Please enter a valid email address.'
      );

      return;

    }


    if(!f.phone.trim()){

      setErr(
        'Please enter your phone number.'
      );

      return;

    }


    /*
     * Bangladesh mobile number:
     * 013XXXXXXXX
     * 014XXXXXXXX
     * 015XXXXXXXX
     * 016XXXXXXXX
     * 017XXXXXXXX
     * 018XXXXXXXX
     * 019XXXXXXXX
     */

    const cleanPhone=
      f.phone
        .trim()
        .replace(
          /[\s-]/g,
          ''
        );


    const phoneRegex=
      /^(?:\+?88)?01[3-9]\d{8}$/;


    if(
      !phoneRegex.test(
        cleanPhone
      )
    ){

      setErr(
        'Please enter a valid Bangladesh phone number.'
      );

      return;

    }


    if(!f.password){

      setErr(
        'Please enter a password.'
      );

      return;

    }


    if(f.password.length<8){

      setErr(
        'Password must be at least 8 characters.'
      );

      return;

    }


    if(!confirmPassword){

      setErr(
        'Please confirm your password.'
      );

      return;

    }


    if(
      f.password!==
      confirmPassword
    ){

      setErr(
        'Passwords do not match.'
      );

      return;

    }


    /* =====================================
       API REQUEST
       ===================================== */

    try{

      setBusy(true);


      /*
       * IMPORTANT:
       *
       * Keeping your ORIGINAL backend
       * field names:
       *
       * firstName
       * lastName
       * email
       * phone
       * password
       */

      const payload={

        firstName:
          f.firstName.trim(),

        lastName:
          f.lastName.trim(),

        email:
          f.email
            .trim()
            .toLowerCase(),

        phone:
          cleanPhone,

        password:
          f.password

      };


      const r=
        await http.post(
          '/auth/register',
          payload
        );


      /* =====================================
         REGISTER SUCCESS
         ===================================== */

      if(
        r?.data?.data
      ){

        setSession(
          r.data.data
        );


        /*
         * User is automatically logged in
         * after successful registration.
         */

        nav(
          '/',
          {
            replace:true
          }
        );

        return;

      }


      /*
       * Registration succeeded but API
       * did not return session data.
       * Send user to login page instead.
       */

      nav(
        '/login',
        {
          replace:true,

          state:{
            registered:true
          }
        }
      );


    }catch(error){

      console.error(
        'REGISTER ERROR:',
        error
      );


      console.error(
        'REGISTER STATUS:',
        error?.response?.status
      );


      console.error(
        'REGISTER RESPONSE:',
        error?.response?.data
      );


      const status=
        error?.response?.status;

      const response=
        error?.response?.data;


      /* =====================================
         BACKEND MESSAGE
         ===================================== */

      if(
        response?.message
      ){

        setErr(
          response.message
        );

      }

      else if(
        response?.error
      ){

        setErr(
          response.error
        );

      }

      else if(status===409){

        setErr(
          'An account with this email or phone number already exists.'
        );

      }

      else if(status===422){

        setErr(
          'Please check your information and try again.'
        );

      }

      else if(status===500){

        setErr(
          'Server could not create your account. Please try again.'
        );

      }

      else if(!error?.response){

        setErr(
          'Cannot connect to the server. Please check that the backend server is running.'
        );

      }

      else{

        setErr(
          'Registration failed. Please try again.'
        );

      }


    }finally{

      setBusy(false);

    }

  };


  /* =========================================
     RENDER
     ========================================= */

  return(

    <AuthShell title="Create account">

      <form
        className="space-y-4"
        onSubmit={submit}
      >


        {/* ===================================
            FIRST NAME
            =================================== */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-slate-700">

            First Name

          </label>

          <input
            type="text"

            autoComplete="given-name"

            className="input"

            placeholder="First name"

            value={
              f.firstName
            }

            onChange={e=>
              change(
                'firstName',
                e.target.value
              )
            }
          />

        </div>


        {/* ===================================
            LAST NAME
            =================================== */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-slate-700">

            Last Name

          </label>

          <input
            type="text"

            autoComplete="family-name"

            className="input"

            placeholder="Last name"

            value={
              f.lastName
            }

            onChange={e=>
              change(
                'lastName',
                e.target.value
              )
            }
          />

        </div>


        {/* ===================================
            EMAIL
            =================================== */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-slate-700">

            Email

          </label>

          <input
            type="email"

            autoComplete="email"

            className="input"

            placeholder="Email address"

            value={
              f.email
            }

            onChange={e=>
              change(
                'email',
                e.target.value
              )
            }
          />

        </div>


        {/* ===================================
            PHONE
            =================================== */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-slate-700">

            Phone

          </label>

          <input
            type="tel"

            inputMode="tel"

            autoComplete="tel"

            className="input"

            placeholder="01XXXXXXXXX"

            value={
              f.phone
            }

            onChange={e=>
              change(
                'phone',
                e.target.value
              )
            }
          />

        </div>


        {/* ===================================
            PASSWORD
            =================================== */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-slate-700">

            Password

          </label>

          <input
            type="password"

            autoComplete="new-password"

            className="input"

            placeholder="Password"

            value={
              f.password
            }

            onChange={e=>
              change(
                'password',
                e.target.value
              )
            }
          />

          <p className="mt-1 text-xs text-slate-400">
            Password must be at least 8 characters.
          </p>

        </div>


        {/* ===================================
            CONFIRM PASSWORD
            =================================== */}

        <div>

          <label className="mb-1.5 block text-sm font-bold text-slate-700">

            Confirm Password

          </label>

          <input
            type="password"

            autoComplete="new-password"

            className="input"

            placeholder="Confirm password"

            value={
              confirmPassword
            }

            onChange={e=>{

              setConfirmPassword(
                e.target.value
              );

              if(err){
                setErr('');
              }

            }}
          />

        </div>


        {/* ===================================
            ERROR
            =================================== */}

        {err&&(

          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-semibold text-red-600">

              {err}

            </p>

          </div>

        )}


        {/* ===================================
            CREATE ACCOUNT BUTTON
            =================================== */}

        <button
          type="submit"

          disabled={busy}

          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >

          {busy
            ? 'Creating Account...'
            : 'Create Account'
          }

        </button>


        {/* ===================================
            LOGIN LINK
            =================================== */}

        <p className="text-center text-sm text-slate-600">

          Already have an account?{' '}

          <Link
            to="/login"
            className="font-bold text-brand-700 hover:underline"
          >

            Sign In

          </Link>

        </p>

      </form>

    </AuthShell>

  );

}