import {useState} from 'react';
import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';

import http from '../api/http';
import {useAuthStore} from '../store/auth';


export default function Login(){

  /* =========================================
     LOGIN FORM
     ========================================= */

  const [f,setF]=useState({
    identifier:'customer@example.com',
    password:'Customer@12345'
  });

  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  const setSession=
    useAuthStore(
      s=>s.setSession
    );

  const nav=
    useNavigate();

  const location=
    useLocation();


  /* =========================================
     SUBMIT LOGIN
     ========================================= */

  const submit=async(e)=>{

    e.preventDefault();

    if(busy){
      return;
    }

    setBusy(true);
    setErr('');


    try{

      const r=
        await http.post(
          '/auth/login',
          {
            identifier:
              f.identifier.trim(),

            password:
              f.password
          }
        );


      setSession(
        r.data.data
      );


      const next=
        location.state?.from||
        '/';


      nav(
        next,
        {
          replace:true
        }
      );


    }catch(e){

      console.error(
        'LOGIN ERROR:',
        e
      );

      console.error(
        'LOGIN RESPONSE:',
        e?.response?.data
      );


      setErr(
        e?.response?.data?.message||
        e?.response?.data?.error||
        'Login failed'
      );


    }finally{

      setBusy(false);

    }

  };


  return(

    <AuthShell title="Welcome back">

      {/* REGISTER SUCCESS MESSAGE */}

      {location.state?.registered&&(

        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">

          Account created successfully.
          You can now sign in.

        </div>

      )}


      <form
        onSubmit={submit}
        className="space-y-4"
      >

        {/* EMAIL / PHONE */}

        <input
          autoComplete="username"

          className="input"

          placeholder="Email or phone"

          value={
            f.identifier
          }

          onChange={e=>
            setF({
              ...f,
              identifier:
                e.target.value
            })
          }
        />


        {/* PASSWORD */}

        <input
          autoComplete="current-password"

          type="password"

          className="input"

          placeholder="Password"

          value={
            f.password
          }

          onChange={e=>
            setF({
              ...f,
              password:
                e.target.value
            })
          }
        />


        {/* ERROR */}

        {err&&(

          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">

            {err}

          </p>

        )}


        {/* LOGIN */}

        <button
          type="submit"

          disabled={busy}

          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >

          {busy
            ? 'Signing in...'
            : 'Sign In'
          }

        </button>


        {/* REGISTER */}

        <p className="text-center text-sm">

          New customer?{' '}

          <Link
            className="font-bold text-brand-700"
            to="/register"
          >
            Create account
          </Link>

        </p>


        {/* DEMO CUSTOMER */}

        <p className="text-center text-xs text-slate-400">

          Demo customer:
          {' '}
          customer@example.com
          {' / '}
          Customer@12345

        </p>

      </form>

    </AuthShell>

  );

}


/* =========================================
   AUTH SHELL
   ========================================= */

export function AuthShell({
  title,
  children
}){

  return(

    <main className="min-h-[70vh] bg-slate-50 py-16">

      <div className="card mx-auto max-w-md p-8">

        <h1 className="mb-6 text-center text-3xl font-black">

          {title}

        </h1>

        {children}

      </div>

    </main>

  );

}