import { 
  useEffect,
  useState
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";


import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles
} from "lucide-react";


import http from "../../api/http";
import {useAuthStore} from "../../store/auth";
import {
  useSiteConfig,
  setting
} from "../../hooks/useSiteConfig";



export default function AdminLogin({
  dynamic=false
}){


const {
  adminSlug
}=useParams();


const loc=useLocation();

const nav=useNavigate();


const {
 data:cfg,
 isLoading
}=useSiteConfig();



const setSession=
useAuthStore(
 s=>s.setSession
);


const user=
useAuthStore(
 s=>s.user
);


const hydrated=
useAuthStore(
 s=>s.hydrated
);



const [f,setF]=useState({

 identifier:
 "admin@shasthocare.local",

 password:
 "Admin@12345"

});



const [show,setShow]=useState(false);

const [err,setErr]=useState("");

const [busy,setBusy]=useState(false);



const configured=
setting(
 cfg,
 "admin.panel_slug",
 "control-center"
);




useEffect(()=>{

setErr("");

},[
loc.pathname
]);





if(
 dynamic &&
 !isLoading &&
 adminSlug!==configured
)

return (

<Navigate
to="/not-found"
replace
/>

);





if(
 hydrated &&
 user?.isAdmin
)

return (

<Navigate
to="/admin"
replace
/>

);







const submit=async(e)=>{


e.preventDefault();


setBusy(true);

setErr("");



try{


const r=
await http.post(
"/auth/login",
f
);



if(
!r.data.data.user?.isAdmin
){

useAuthStore
.getState()
.logoutLocal();


setErr(
"This account does not have admin access."
);


return;

}



setSession(
r.data.data
);



nav(
"/admin",
{
replace:true
}
);



}
catch(e){


setErr(
e?.response?.data?.message ||
"Admin sign in failed"
);


}
finally{


setBusy(false);


}


};








return (



<main className="

min-h-screen

relative

overflow-hidden

bg-[#071c1b]

flex

items-center

justify-center

p-5

">






{/* BACKGROUND EFFECT */}


<div className="

absolute

w-[500px]

h-[500px]

rounded-full

bg-[#14B8A6]/20

blur-[120px]

top-[-150px]

left-[-150px]

"/>



<div className="

absolute

w-[450px]

h-[450px]

rounded-full

bg-[#0F766E]/30

blur-[120px]

bottom-[-150px]

right-[-150px]

"/>









<div className="

relative

w-full

max-w-md

">






{/* BRAND */}


<div className="

text-center

text-white

mb-8

">


<div className="

mx-auto

w-20

h-20

rounded-3xl

bg-gradient-to-br

from-[#14B8A6]

to-[#0F766E]

flex

items-center

justify-center

shadow-2xl

">

<ShieldCheck

size={42}

/>

</div>





<h1 className="

mt-5

text-4xl

font-black

tracking-tight

">


{
setting(
cfg,
"brand.name",
"ShasthoCare"
)
}

<br/>

<span className="

text-[#14B8A6]

">

Admin Portal

</span>


</h1>




<p className="

text-slate-400

mt-3

flex

justify-center

items-center

gap-2

">

<Sparkles size={14}/>

Secure Healthcare Control Center

</p>



</div>










{/* CARD */}



<form

onSubmit={submit}

className="

bg-white/95

backdrop-blur-xl

rounded-[32px]

p-8

shadow-2xl

border

border-white/20

"

>





<div className="

rounded-2xl

bg-[#F0FDFA]

border

border-[#CCFBF1]

p-4

mb-6

">


<div className="

flex

gap-3

text-[#0F766E]

">


<ShieldCheck size={22}/>


<div>


<h3 className="

font-black

">

Administrator Login

</h3>



<p className="

text-xs

text-slate-600

mt-1

leading-5

">

Role verification is handled securely by the server.

<br/>

Recovery:

<b>
/admin/login
</b>

</p>


</div>


</div>


</div>







<label className="

text-sm

font-bold

text-slate-700

">

Email / Phone

</label>



<input


autoComplete="username"


className="

mt-2

w-full

rounded-xl

bg-slate-100

px-5

py-3

outline-none

focus:ring-2

focus:ring-[#14B8A6]

"


value={f.identifier}


onChange={e=>

setF({

...f,

identifier:e.target.value

})

}

/>









<label className="

block

mt-5

text-sm

font-bold

text-slate-700

">

Password

</label>




<div className="

relative

mt-2

">


<input


type={
show
?
"text"
:
"password"
}


autoComplete="current-password"


className="

w-full

rounded-xl

bg-slate-100

px-5

py-3

pr-12

outline-none

focus:ring-2

focus:ring-[#14B8A6]

"


value={f.password}


onChange={e=>

setF({

...f,

password:e.target.value

})

}


/>



<button

type="button"

onClick={()=>setShow(!show)}

className="

absolute

right-4

top-1/2

-translate-y-1/2

text-slate-400

"

>


{
show
?
<EyeOff size={19}/>
:
<Eye size={19}/>
}


</button>


</div>








{
err &&


<div className="

mt-5

rounded-xl

bg-red-50

text-red-700

p-3

text-sm

font-semibold

">

{err}

</div>


}








<button


disabled={busy}


className="

mt-6

w-full

rounded-xl

bg-gradient-to-r

from-[#0F766E]

to-[#14B8A6]

text-white

py-3.5

font-black

flex

items-center

justify-center

gap-2

hover:opacity-90

transition

disabled:opacity-50

"


>


<LockKeyhole size={18}/>


{

busy

?

"Signing in..."

:

"Access Admin Panel"

}



</button>








<p className="

mt-6

text-center

text-xs

text-slate-400

">


Development:

<br/>

admin@shasthocare.local

/

Admin@12345


</p>



</form>





</div>





</main>


);


}