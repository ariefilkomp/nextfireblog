import { arrayUnion, updateDoc } from "firebase/firestore";
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { getFirebase } from "../lib/firebase";
import Loader from "./Loader";


//upload images to firebase storage

export default function ImagePostUploader({updateImages, setUrl}) {
    const { auth, storage } = getFirebase();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState(null);

    const uploadFile = async (e) => {
        const file = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        const rf = ref(storage, `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);

        setUploading(true);

        const task = uploadBytesResumable(rf, file);

        task.on('state_changed', 
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + pct + '% done');
                setProgress(pct);

                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                // Handle unsuccessful uploads
            }, 
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(task.snapshot.ref).then((url) => {
                    //console.log('File available at', url);
                    setUrl(url);
                    setDownloadURL(url);
                    setUploading(false);
                    updateImages(url);
                });
            }
        );
    }

    return (
        <div className="flex justify-between">
            <Loader show={uploading} />
            {uploading && <h3>Progress {progress}%</h3>}

            {!uploading &&
            <>
                <label className="px-4 py-2 bg-slate-300 hover:bg-slate-400 hover:text-white rounded mb-4 cursor-pointer">
                    📷 Upload Image
                    <input type="file" className="cursor-pointer absolute block opacity-0 pin-r pin-t" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
                </label>
            </>
            }

            {downloadURL && <code className="w-3/4 ml-auto bg-white p-2 mb-4">{downloadURL}</code>}
        </div>
    );
} 