import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  getAuth,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  addDoc,
  getDoc,
  collection,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  updateDoc,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  updateDoc,
  documentId,
} from 'firebase/firestore';
import { Database } from 'firebase/database';
import {
  getStorage, ref, getDownloadURL, uploadBytes,
} from 'firebase/storage';
import { auth, db } from '../firebase.js';

export const validatePassword = (password1, password2) => {
  if (password1 === password2) {
    return true;
  }
  return false;
};

export const validateEmail = (email) => {
  /* const validFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; */
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  return false;
};

export const createUser = (email, password, name) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      const loggedUser = auth.currentUser;
      loggedUser.getIdToken(true)
        .then(() => {
          updateProfile(loggedUser, {
            displayName: name, photoURL: '',
          });
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
        });
    });
};

const storage = getStorage();

export const imgReference = (useruid) => {
  console.log(`${useruid}.`);
  return getDownloadURL(ref(storage, (`${useruid}.png`)));
};

export const userLogin = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const userGoogleLogin = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const userLogout = () => signOut(auth);

export const createPost = (text) => addDoc(collection(db, 'posts'), {
  content: text,
  time: serverTimestamp(),
  email: auth.currentUser.email,
  displayName: auth.currentUser.displayName,
});

export const createDeleteModal = (docId) => {
  const deleteModal = document.createElement('dialog');
  const modalContentDiv = document.createElement('div');
  const modalActionDiv = document.createElement('div');
  const modalMsg = document.createElement('h2');
  const deleteButton = document.createElement('button');
  const cancelButton = document.createElement('button');


  deleteModal.classList.add('big-modal-div');
  modalContentDiv.classList.add('modal-div');
  modalActionDiv.classList.add('modal-div');
  deleteButton.classList.add('navBttn');
  cancelButton.classList.add('navBttn');
  deleteModal.id = 'delete-modal';
  deleteButton.id = 'delete-button';
  cancelButton.id = 'cancel-button';
  modalMsg.innerHTML = '';
  modalMsg.innerHTML = '¿Quieres eliminar esta publicación?';
  deleteButton.textContent = 'Eliminar';
  cancelButton.textContent = 'Cancelar';

  deleteButton.addEventListener('click', async () => {
    const docRef = doc(db, 'posts', docId);
    await deleteDoc(docRef);
  });
  cancelButton.addEventListener('click', () => deleteModal.close());

  modalContentDiv.appendChild(modalMsg);
  modalActionDiv.appendChild(deleteButton);
  modalActionDiv.appendChild(cancelButton);
  deleteModal.appendChild(modalContentDiv);
  deleteModal.appendChild(modalActionDiv);

  return deleteModal;
};

export const createEditModal = (content, docId) => {
  const editModal = document.createElement('dialog');
  const modalContentDiv = document.createElement('div');
  const modalActionDiv = document.createElement('div');
  const modalMsg = document.createElement('h2');
  const modalInput = document.createElement('textarea');
  const editButton = document.createElement('button');
  const cancelButton = document.createElement('button');

  editModal.classList.add('big-modal-div');
  modalContentDiv.classList.add('modal-div');
  modalActionDiv.classList.add('modal-div');
  editButton.classList.add('navBttn');
  cancelButton.classList.add('navBttn');
  modalContentDiv.id = 'edit-content-div';
  editModal.id = 'edit-modal';
  editModal.style.height = '200px';
  editButton.id = 'edit-button';
  cancelButton.id = 'cancel-button';
  modalMsg.innerHTML = '';
  modalMsg.innerHTML = 'Editar publicación: <br>';
  modalInput.id = 'new-input';
  modalInput.attribute = 'rows=3';
  modalInput.style.height = '70px';
  modalInput.placeholder = content;
  modalInput.style.width = '400px';
  editButton.textContent = 'Editar';
  cancelButton.textContent = 'Cancelar';
  modalContentDiv.style.display = 'flex';
  modalContentDiv.style.flexDirection = 'column';
  modalContentDiv.style.alignItems = 'space-between';

  editButton.addEventListener('click', async () => {
    const docRef = doc(db, 'posts', docId);
    let newInput = document.getElementById('new-input').value;
    newInput = modalInput.value;
    await updateDoc(docRef, {
      content: `${newInput}`,
    });
  });
  cancelButton.addEventListener('click', () => editModal.close());

  modalContentDiv.appendChild(modalMsg);
  modalContentDiv.appendChild(modalInput);
  modalActionDiv.appendChild(editButton);
  modalActionDiv.appendChild(cancelButton);
  editModal.appendChild(modalContentDiv);
  editModal.appendChild(modalActionDiv);

  return editModal;
};

export const createPostDiv = (name, localDate, localTime, content, docId) => {
  const postDiv = document.createElement('div');
  const editDiv = document.createElement('div');
  const deleteDiv = document.createElement('div');
  const userP = document.createElement('p');
  const msgP = document.createElement('p');
  const editBttn = document.createElement('button');
  const deleteBttn = document.createElement('button');
  const deleteModal = createDeleteModal(`${docId}`);
  const editModal = createEditModal(`${content}`, `${docId}`);
  const loggedUser = auth.currentUser.displayName;
  postDiv.classList.add('publicacionPost');
  editDiv.classList.add('editarPublicacion');
  deleteDiv.classList.add('eliminarPublicacion');
  userP.classList.add('usuario');
  msgP.classList.add('descripcionPost');
  editBttn.classList.add('editar');
  deleteBttn.classList.add('eliminar');
  userP.textContent = `${name} publicó el ${localDate} a las ${localTime} :`;
  msgP.textContent = `${content}`;
  editBttn.id = 'edit-button';
  deleteBttn.id = 'delete-button';
  editBttn.textContent = 'Editar';
  deleteBttn.textContent = 'Eliminar';

  editBttn.addEventListener('click', () => {
    editModal.showModal();
  });
  deleteBttn.addEventListener('click', () => {
    deleteModal.showModal();
  });

  postDiv.appendChild(userP);
  postDiv.appendChild(msgP);
  if (`${name}` === loggedUser) {
    editDiv.appendChild(editBttn);
    deleteDiv.appendChild(deleteBttn);
    postDiv.appendChild(editDiv);
    postDiv.appendChild(deleteDiv);
    postDiv.appendChild(deleteModal);
    postDiv.appendChild(editModal);
  }
  return postDiv;
};

export const deletePost = () => {
  const loggedUser = auth.currentUser;
  const postsRef = query(collection(db, 'posts'), orderBy('time', 'desc'));
  loggedUser.getIdToken(true)
    .then(() => {
      deleteDoc(loggedUser);
    })
    .catch((error) => {
      console.log('Error fetching user data:', error);
    });
};

// para dar like
export const addLike = (id, likes) => {
  console.log(id);
  if (likes.length === 0 || !(likes.includes(auth.currentUser.email))) {
    updateDoc(doc(db, 'posts', id), {
      likes: arrayUnion(auth.currentUser.email),
    });
  }
};

// para quitar like
export const removeLike = (id) => updateDoc(doc(db, 'posts', id), {
  likes: arrayRemove(auth.currentUser.email),
});
