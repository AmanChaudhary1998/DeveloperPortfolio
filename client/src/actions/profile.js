import axios from 'axios';
import {setAlert} from './alert';

import {ACCOUNT_DELETE, CLEAR_PROFILE, GET_PROFILE, GET_PROFILES, PROFILE_ERROR, UPDATE_PROFILE} from './types';

// GET all profile
export const getProfiles = () => async dispatch => {
    dispatch({ type: CLEAR_PROFILE })
    try {
        const res = await axios.get('/api/profile');
        dispatch({
            type: GET_PROFILES,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload:{msg: error.response.statusText, status: error.response.status}
        });
    }
}

// GET user profile by userId
export const getProfilebyuserId = userId => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/user/${userId}`);

        dispatch({
            type:GET_PROFILE,
            payload:res.data
        });
    } catch (error) {
        dispatch({
            type:PROFILE_ERROR,
            payload:{msg:error.response.statusText, status:error.response.status}
        });
    }
}

// GET current profile
export const getCurrentProfile = () => async dispatch =>{
    try {
        const res = await axios.get('/api/profile/me');

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload:{msg: error.response.statusText, status: error.response.status}
        });
    }
};

// Create or Update profile
export const createProfile = (formData, history, edit= false) => async dispatch =>{
    try {
        const config = {
            headers:{
                'Content-Type':'application/json'
            }
        }
        const res = await axios.post('/api/profile',formData,config);

        dispatch({
            type:GET_PROFILE,
            payload:res.data
        });

        dispatch(setAlert(edit? 'Profile Updated': 'Profile Created','success'));

        if(!edit)
        {
            history.push('/dashboard');
        }
    } catch (error) {
        const errors = error.response.data.errors;

        if(errors)
        {
            errors.forEach(error => dispatch(setAlert(error.msg,'danger')));
        }

        dispatch({
            type:PROFILE_ERROR,
            payload:{msg: error.response.statusText, status:error.response.status}
        })
    }
}

// Add Experience
export const addExperience = (formData,history) => async dispatch => {
    try {
        const config = {
            headers:{
                'Content-Type':'application/json'
            }
        }
        const res = await axios.put('/api/profile/experience',formData,config);

        dispatch({
            type: UPDATE_PROFILE,
            payload:res.data
        });
        dispatch(setAlert('Experience Added','success'));
        history.push('/dashboard');
    } catch (error) {
        const errors = error.response.data.errors;

        if(errors)
        {
            errors.forEach(error => dispatch(setAlert(error.msg,'danger'))); 
        }

        dispatch({
            type: PROFILE_ERROR,
            payload:{msg:error.response.statusText, status:error.response.status}
        })
    }
}

// Add Education
export const addEducation = (formData,history) => async dispatch =>{
    try {
        const config = {
            headers:{
                'Content-Type':'application/json'
            }
        }
        const res = await axios.put('/api/profile/education',formData,config);
        console.log(res.data);
        dispatch({
            type: UPDATE_PROFILE,
            payload:res.data
        });
        dispatch(setAlert('Education Added','success'));
        history.push('/dashboard');
    } catch (error) {
        const errors = error.response.data.errors
        
        if(errors)
        {
            errors.forEach(error => dispatch(setAlert(error.msg,'danger')));
        }
        dispatch({
            type:PROFILE_ERROR,
            payload:{msg:error.message.statusText, status:error.message.status}
        })
    }
}

// DELETE experience/id
export const deleteExperience = (id) => async dispatch =>{
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload:res.data
        });
        dispatch(setAlert('Experience deleted','success'));
    } catch (error) {
        dispatch({
            type:PROFILE_ERROR,
            payload:{msg:error.message.statusText, status:error.message.status}
        })
    }
}

// Delete education/id
export const deleteEducation = (id) => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload:res.data
        });
        dispatch(setAlert('Education Deleted','success'));
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload:{msg:error.message.statusText, status:error.message.status}
        });
    }
};

// DELETE Account
export const deleteAccount = () => async dispatch => {
    if(window.confirm('Are you sure? Account has been deleted permanentaly'))
    {
        try {
                await axios.delete('/api/profile');
    
            dispatch({
                type:CLEAR_PROFILE
            });
            dispatch({
                type:ACCOUNT_DELETE
            });
            dispatch(setAlert('Accounted Deleted successfully'))
        } catch (error) {
            dispatch({
                type: PROFILE_ERROR,
                payload:{msg:error.message.statusText, status:error.message.status}
            });
        }
    }
}