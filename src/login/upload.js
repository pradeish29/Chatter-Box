import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "../Firebase";
import { toast } from 'react-toastify';

const upload = async (file)=> {
const date = new Date();

const storageRef = ref(storage, `images/${date + file.name}`);
const uploadTask = uploadBytesResumable (storageRef, file);
return new Promise((resolve, reject) => {
    // const toastId = toast.loading("Uploading...");
    uploadTask.on(
    "state_changed",
    (snapshot)=>{
    const progress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        // toast.update(toastId, { render: `Upload is ${progress.toFixed(2)}% done`, type: toast.TYPE.INFO, isLoading: true });
        toast.info(`Upload is ${progress.toFixed(2)}% done`);
    },
    (error)=> {
        reject("Something went wrong!" + error.code);
        toast.error("Something went wrong: " + error.code);
    },
    () => {
        getDownloadURL (uploadTask.snapshot.ref).then((downloadURL) => {
            toast.success("Upload successful!");
        resolve(downloadURL);
        });
      }
    );
  });
}
export default upload;