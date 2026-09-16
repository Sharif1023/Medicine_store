import {
  useQuery,
  useQueryClient
} from '@tanstack/react-query';

import http from '../../api/http';

import {
  useRef,
  useState
} from 'react';


export default function Prescriptions(){

  const qc=useQueryClient();

  const [files,setFiles]=useState([]);

  const [uploading,setUploading]=useState(false);

  const [error,setError]=useState('');

  const inputRef=useRef(null);


  /* =========================================
     GET PRESCRIPTIONS
     ========================================= */

  const {data=[]}=useQuery({

    queryKey:[
      'prescriptions'
    ],

    queryFn:()=>
      http
        .get(
          '/user/prescriptions'
        )
        .then(
          r=>r.data.data
        ),

  });


  /* =========================================
     FILE SELECT
     ========================================= */

  const handleFiles=(e)=>{

    setError('');

    const selected=
      Array.from(
        e.target.files||[]
      );


    /* Maximum 3 files */

    if(selected.length>3){

      setError(
        'You can upload maximum 3 prescriptions at a time.'
      );

      e.target.value='';

      setFiles([]);

      return;

    }


    /* Validate file type */

    const allowedTypes=[
      'image/jpeg',
      'image/png',
      'application/pdf',
    ];


    const invalid=
      selected.find(
        file=>
          !allowedTypes.includes(
            file.type
          )
      );


    if(invalid){

      setError(
        'Only JPG, PNG and PDF files are allowed.'
      );

      e.target.value='';

      setFiles([]);

      return;

    }


    setFiles(
      selected
    );

  };


  /* =========================================
     REMOVE SELECTED FILE
     ========================================= */

  const removeFile=(index)=>{

    setFiles(
      previous=>
        previous.filter(
          (_,i)=>
            i!==index
        )
    );

  };


  /* =========================================
     UPLOAD PRESCRIPTIONS
     ========================================= */

  const upload=async()=>{

    if(
      files.length===0||
      uploading
    ){
      return;
    }


    try{

      setUploading(true);

      setError('');


      /*
       * Existing backend accepts one "file".
       * So each selected file is uploaded
       * separately to the same endpoint.
       */

      await Promise.all(

        files.map(
          file=>{

            const fd=
              new FormData();


            fd.append(
              'file',
              file
            );


            return http.post(
              '/user/prescriptions',
              fd
            );

          }
        )

      );


      /* Clear selected files */

      setFiles([]);


      if(inputRef.current){

        inputRef.current.value='';

      }


      /* Refresh prescriptions */

      await qc.invalidateQueries({

        queryKey:[
          'prescriptions'
        ],

      });


    }catch(err){

      console.error(
        err
      );


      setError(
        err?.response?.data?.message||
        'Prescription upload failed. Please try again.'
      );


    }finally{

      setUploading(false);

    }

  };


  /* =========================================
     RENDER
     ========================================= */

  return(
    <>

      <h1 className="text-3xl font-black">
        Prescriptions
      </h1>


      {/* =====================================
          UPLOAD CARD
          ===================================== */}

      <div className="card mt-6 p-6">

        <div>

          <h2 className="text-lg font-bold text-slate-900">
            Upload Prescription
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            You can upload up to 3 JPG, PNG or PDF files at once.
          </p>

        </div>


        <input
          ref={inputRef}

          type="file"

          multiple

          accept="
            image/jpeg,
            image/png,
            application/pdf
          "

          onChange={
            handleFiles
          }

          className="mt-5 block w-full text-sm text-slate-600"
        />


        {/* SELECTED FILES */}

        {files.length>0&&(

          <div className="mt-5 space-y-2">

            <div className="text-sm font-bold text-slate-700">

              Selected files ({files.length}/3)

            </div>


            {files.map(
              (file,index)=>(

                <div
                  key={
                    `${file.name}-${index}`
                  }

                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >

                  <div className="min-w-0">

                    <div className="truncate text-sm font-semibold text-slate-800">

                      {file.name}

                    </div>


                    <div className="mt-0.5 text-xs text-slate-500">

                      {
                        (
                          file.size/
                          1024/
                          1024
                        ).toFixed(2)
                      } MB

                    </div>

                  </div>


                  <button
                    type="button"

                    disabled={
                      uploading
                    }

                    onClick={()=>
                      removeFile(
                        index
                      )
                    }

                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >

                    Remove

                  </button>

                </div>

              )
            )}

          </div>

        )}


        {/* ERROR */}

        {error&&(

          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">

            {error}

          </div>

        )}


        {/* UPLOAD BUTTON */}

        <button
          type="button"

          onClick={
            upload
          }

          disabled={
            files.length===0||
            uploading
          }

          className="btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {uploading
            ? `Uploading ${files.length} file${files.length>1?'s':''}...`
            : `Upload ${files.length||''} Prescription${files.length>1?'s':''}`
          }

        </button>

      </div>


      {/* =====================================
          PRESCRIPTION LIST
          ===================================== */}

      <div className="mt-6 space-y-3">

        {data.map(
          p=>(

            <div
              className="card flex items-center justify-between gap-4 p-5"
              key={p.id}
            >

              <div>

                <div className="font-semibold text-slate-900">

                  Prescription #{p.id}

                </div>


                <div className="mt-1 text-xs text-slate-500">

                  {
                    new Date(
                      p.created_at
                    ).toLocaleString()
                  }

                </div>

              </div>


              <span className="badge bg-slate-100">

                {p.status}

              </span>

            </div>

          )
        )}

      </div>

    </>
  );

}