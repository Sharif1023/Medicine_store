import {
  Bell,
  ClipboardList,
  Heart,
  Home,
  MapPin,
  RotateCcw,
  Star,
  UserRound,
  CalendarDays,
  LogOut,
} from 'lucide-react';

import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import http from '../api/http';



const links = [

  ['/account', 'Dashboard', Home, true],

  ['/account/profile', 'Profile', UserRound],

  ['/account/orders', 'Orders', ClipboardList],

  ['/account/prescriptions', 'Prescriptions', ClipboardList],

  ['/account/wishlist', 'Wishlist', Heart],

  ['/account/addresses', 'Addresses', MapPin],

  ['/account/reviews', 'Reviews', Star],

  ['/account/returns', 'Returns', RotateCcw],

  ['/account/bookings', 'Bookings', CalendarDays],

  ['/account/notifications', 'Notifications', Bell],

];



export default function Account() {


  const user = useAuthStore(
    state => state.user
  );


  const logoutLocal = useAuthStore(
    state => state.logoutLocal
  );



  const handleLogout = async()=>{


    try{

      await http.post(
        '/auth/logout'
      );


    }catch(error){

      console.error(
        'Logout request failed:',
        error
      );

    }


    finally{

      logoutLocal();

      window.location.href='/';

    }


  };




return (

<main className="container-app py-10">


<div className="
grid
gap-7
lg:grid-cols-[250px_1fr]
">





{/* DESKTOP SIDEBAR */}

<aside className="
hidden
card
h-fit
p-4
lg:block
">


<div className="border-b p-3">


<div className="
text-xs
text-slate-500
">

Signed in as

</div>



<div className="font-black">

{user?.firstName || 'Customer'}

</div>


</div>





<nav className="
mt-3
space-y-1
">


{
links.map(
([to,label,Icon,end])=>(


<NavLink

end={Boolean(end)}

key={to}

to={to}

className={({isActive})=>

`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
isActive
?
'bg-brand-600 text-white'
:
'hover:bg-brand-50 hover:text-brand-700'
}`

}


>


<Icon size={17}/>

{label}


</NavLink>


)

)

}




<button

type="button"

onClick={handleLogout}

className="
flex
w-full
items-center
gap-2
rounded-xl
px-3
py-2.5
text-left
text-sm
font-bold
text-red-600
hover:bg-red-50
"

>


<LogOut size={17}/>

Logout


</button>



</nav>



</aside>








{/* MOBILE MENU */}

<div className="
lg:hidden
space-y-4
">


<div className="card p-4">


<div className="text-xs text-slate-500">

Signed in as

</div>


<div className="font-black">

{user?.firstName || 'Customer'}

</div>


</div>





<div className="
grid
grid-cols-4
gap-3
">


{

links.map(
([to,label,Icon,end])=>(


<NavLink

key={to}

to={to}

end={Boolean(end)}

className={({isActive})=>

`
flex
flex-col
items-center
justify-center
rounded-xl
border
p-3
text-center
transition
${
isActive
?
'bg-brand-600 text-white border-brand-600'
:
'bg-white hover:bg-brand-50'
}
`

}


>


<Icon size={22}/>


<span className="
mt-2
text-[11px]
font-bold
leading-tight
">

{label}

</span>


</NavLink>


)

)

}




{/* LOGOUT */}

<button

type="button"

onClick={handleLogout}

className="
flex
flex-col
items-center
justify-center
rounded-xl
border
p-3
text-center
text-red-600
bg-white
hover:bg-red-50
"

>


<LogOut size={22}/>


<span className="
mt-2
text-[11px]
font-bold
">

Logout

</span>


</button>



</div>


</div>







{/* PAGE CONTENT */}

<section className="
min-w-0
">

<Outlet/>

</section>




</div>


</main>

);


}