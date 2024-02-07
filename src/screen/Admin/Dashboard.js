import React, { useEffect, useState, useCallback } from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';
import AuthSlider from '../../components/AuthSlider';
import TopicHead from '../../components/TopicHead';
import Loader from '../../components/Loader';
import ModalError from '../../components/ModalError.js';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { loadClients, deleteClient } from "../../store/action/userAppStorage";
import AOS from 'aos'
import "aos/dist/aos.css";

//let { admin} = useSelector(state => state.userAuth)
function Dashboard({ status }) {
    let [isLoading, setIsLoading] = useState(false)
    let [searchBy, setSearchBy] = useState('CLIENT_NAME')
    let [searchKeyWord, setSearchKeyWord] = useState('')
    let [filteredList, setFilteredList] = useState([])
    let [isError, setIsError] = useState(false)
    let [errorContent, setErrorContent] = useState('')
    let [isExpired, setIsExpired] = useState()

    let navigate = useNavigate()
    let dispatch = useDispatch()


    let { admin, clients } = useSelector(state => state.userAuth)
    useEffect(() => {
        if (!admin) {
            return navigate('/login')
        }
        //hence no redirect
    }, [])

    let fetchAllClients = useCallback(async () => {
        setIsLoading(true)
        let res = await dispatch(loadClients())
        if (!res.bool) {
            throw new Error('error occured')
        }
        return res.message.users
    }, [loadClients])
    //fetch all client from the server

    useEffect(() => {
        fetchAllClients().then(data => {
            setIsLoading(false)
        }).catch(data => {
            setIsError(true)
            setErrorContent(data)
            setIsLoading(false)
        })
    }, [fetchAllClients])


/*
    useEffect(() => {
        setFilteredList(clients)
    },[])
    */


    let deleteHandler = async (id) => {
        setIsLoading(true)
        let res = await dispatch(deleteClient(id))
        if (!res.bool) {
            setIsError(true)
            setErrorContent(res.message)
            setIsLoading(false)
            return
        }
        setIsLoading(false)
    }

    let editHandler = (id) => {
        navigate(`/add/${id}`)

    }

    //sorting algorithms
    let sortByYear = (obj) => {
        return obj.sort((a, b) => {
            let expiry = new Date(a.installation_date)
            let expiry2 = new Date(b.installation_date)
            return expiry - expiry2
        })
    }


    //search by date
    let search = (searchType, searchKeyWord, arr) => {
        //then search by client name
        if (!searchType || !searchKeyWord || searchType === ' ' || searchKeyWord === ' ') {
            return []
        }
        searchType = searchType.toLowerCase()
        searchKeyWord = searchKeyWord.toLowerCase()

        let res = arr.filter(data => {
            if (data[`${searchType}`].toLowerCase().includes(searchKeyWord)) {
                return data
            }
        })
        return res
    }

    let searchByHandler = (e) => {
        setSearchBy(e.target.value)
    }

    let keywordHandler = (e) => {
        setSearchKeyWord(e.target.value)
        setFilteredList(search(searchBy, e.target.value, clients))
    }

    let gotIt = () => {
        setIsError(false)
        setErrorContent('')
        setIsLoading(false)
    }




    let changeExpiredHandler = (e) => {
        if (e.target.value === 'true') {
            //fetch all that have expired
            let expiredUsers = clients.filter(data => data.isExpire == true)
            setFilteredList(expiredUsers)
            return setIsExpired(e.target.value)
        }
       
        setFilteredList(clients)
        return setIsExpired(e.target.value)
    }



    return (
        <>{isLoading ? <Loader /> : <></>}
            {isError ? <ModalError errorText={errorContent} gotIt={gotIt} /> : <></>}
            {isLoading ? <Loader /> : <></>}
            <Navigation activeScreen='dashboard' status={true} />
            <AuthSlider status={status} />

            <div className='dashboard-main' >
                <h1>Advance search filters</h1>

                <div className='search-section'>
                    <div className='search-type'>
                        <label>SearchBy:</label>
                        <select className='dashboard-input'
                            value={searchBy} onChange={searchByHandler}>
                            <option>CLIENT_NAME</option>
                            <option>CLIENT_PHONE_NUMBERS</option>
                            <option>CHASIS_NO</option>
                            <option>VEHICLE_REG_NO</option>
                            <option>TRACKER_SIM_NO</option>
                            <option>TRACKER_ID</option>
                            <option>INSTALLATION_DATE</option>
                            <option>EXPIRING_DATE</option>
                        </select>
                    </div>

                    <div className='search-type'>
                        <label>Keyword:</label>
                        <input className='dashboard-input' onChange={keywordHandler} value={searchKeyWord} autoCorrect={false}></input>

                    </div>


                    <div className='search-type'>
                        <label>Expired:</label>


                        <select className='dashboard-input'
                            value={isExpired} onChange={changeExpiredHandler}>
                            <option>false</option>
                            <option>true</option>

                        </select>


                    </div>
                </div>

               {/* <TopicHead headText='LIST OF ALL' colorText='CLIENTS' />*/}

                <div className='table-container' >
                    <table>
                        <thead>
                            <tr>
                                <th>S/N NO</th>
                                <th>CLIENT NAME</th>
                                <th>CLIENT PHONE NUMBERS</th>
                                <th>RIDER NAME</th>
                                <th>CHASIS NO:</th>
                                <th>VEHICLE REG NO:</th>
                                <th>TRACKER SIM NO</th>
                                <th>TRACKER ID</th>
                                <th>INSTALLATION DATE</th>
                                <th>EXPIRING DATE</th>
                                {admin && admin.isMainAdmin ? <th>EDIT</th> : <></>}
                                {admin && admin.isMainAdmin ? <th>DELETE</th> : <></>}
                            </tr>

                        </thead>
                        <tbody>
                            {filteredList.length > 0 ? sortByYear(filteredList).map((data,index) => <tr key={data._id}>
                                <td>{index + 1}</td>
                                <td>{data.client_name}</td>
                                <td>{data.client_phone_numbers} </td>
                                <td>{data.rider_name_no} </td>
                                <td>{data.chasis_no}</td>
                                <td>{data.vehicle_reg_no}</td>
                                <td>{data.tracker_sim_no}</td>
                                <td>{data.tracker_id}</td>
                                <td>{data.installation_date}</td>
                                <td>{data.expiring_date}</td>
                                {admin && admin.isMainAdmin ? <td onClick={() => editHandler(data._id)}><span className='material-icons'>edit</span></td> : <></>}
                                {admin && admin.isMainAdmin ? <td onClick={() => deleteHandler(data._id)}><span className='material-icons'>delete</span></td> : <></>}

                            </tr>) :sortByYear(clients).map((data,index) => <tr key={data._id}>
                                <td>{index + 1}</td>
                                <td>{data.client_name}</td>
                                <td>{data.client_phone_numbers} </td>
                                <td>{data.rider_name_no} </td>
                                <td>{data.chasis_no}</td>
                                <td>{data.vehicle_reg_no}</td>
                                <td>{data.tracker_sim_no}</td>
                                <td>{data.tracker_id}</td>
                                <td>{data.installation_date}</td>
                                <td>{data.expiring_date}</td>
                                {admin && admin.isMainAdmin ? <td onClick={() => editHandler(data._id)}><span className='material-icons'>edit</span></td> : <></>}
                                {admin && admin.isMainAdmin ? <td onClick={() => deleteHandler(data._id)}><span className='material-icons'>delete</span></td> : <></>}

                            </tr>)}

                        
                        </tbody>
                    </table>
                </div>
            </div>



        </>

    );
}

export default Dashboard;