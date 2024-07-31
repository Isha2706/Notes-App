import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import NoteCard from '../../components/Cards/NoteCard'
import { MdAdd } from 'react-icons/md'
import AddEditNotes from './AddEditNotes'
import Modal from "react-modal"
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import Toast from '../../components/ToastMessage/Toast'
import EmptyCard from '../../components/EmptyCard/EmptyCard'
import AddNoteImg from '../../assets/images/add-note.svg'
import NoDataImg from '../../assets/images/no-data.svg'

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showTokenMsg, setShowTokenMsg] = useState({
    isShown: false,
    message: '',
    type: 'add',
  })
  const [allNotes, setAllNotes] = useState([])
  const [userInfo, setUSerInfo] = useState(null);

  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  }

  const showTokenMessage = (message, type) => {
    setShowTokenMsg({
      isShown: true,
      message,
      type,

    })
  }

  const handleCloseToast = () => {
    setShowTokenMsg({
      isShown: false,
      message: '',

    })
  }

  // Get user Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUSerInfo(response.data.user);
      }
    } catch (error) {
      // check..
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  }

  // Get all Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  }

  // Delete Notes
  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`);
      if (response.data && !response.data.error) {
        showTokenMessage('Note Deleted Successfully', 'delete')
        getAllNotes();

      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("An unexpected error occurred. Please try again.");
      }
    }

  }

  // Search For a Notes 
  const onSearchNotes = async (query)=>{
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: {query},
      });
      if(response.data && response.data.notes){
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);    
    }
  }

  const handleClearSearch = ()=>{
    setIsSearch(false);
    getAllNotes();
  }

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, [])


  return (
    <>
      <Navbar userInfo={userInfo} onSearchNotes={onSearchNotes} handleClearSearch={handleClearSearch}/>

      <div className='container mx-auto'>
        {allNotes > 0 ? (
          <div className='grid grid-cols-3 gap-4 mt-8'>
            {
              allNotes.map((item, index) => {
                <NoteCard
                  key={item._id}
                  title={itme.title}
                  date={item.createdOn}
                  content={itme.content}
                  tags={itme.tags}
                  isPinned={itme.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => { }}
                />
              })
            }
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? handleClearSearch : AddNoteImg}
            message={isSearch ? `Oops! No notes found matching your search.` : `Start creating your first note! click the 'Add' button to jot down your thoughts, idea, and reminders. Let's get started!`} />
        )
        }
      </div>

      <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10 ' onClick={() => {
        setOpenAddEditModal({ isShown: true, type: "add", data: null });
      }}><MdAdd className='text-[32px] text-white' /></button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => { }}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        }}
        contentLabel=""
        className=" w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >

        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes()}
          showTokenMessage={showTokenMessage()}
        />
      </Modal>

      <Toast
        isShown={showTokenMsg.isShown}
        message={showTokenMsg.message}
        type={showTokenMsg.type}
        onClose={handleCloseToast}
      />

    </>
  )
}

export default Home