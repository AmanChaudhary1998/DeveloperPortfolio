import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import {deleteEducation} from '../../actions/profile';

const Education = ({education, deleteEducation}) =>{
    const educations = education.map((edu)=>(
        <tr key={edu._id}>
        <td className='hide-sm'>{edu.degree}</td>
        <td className='hide-sm'>{edu.fieldofstudy}</td>
        <td>
        <Moment format='YYYY/MM/DD'>{edu.from}</Moment> -
                    {edu.to ===null?('Now'):(<Moment format='YYYY/MM/DD'>{edu.to}</Moment>)}
        </td>
        <td>
            <button onClick={()=> deleteEducation(edu._id)} className='btn btn-danger'>Delete</button>
        </td>
        </tr>
    ))
    return (
        <>
        <h2 className='my-2'>Education Info</h2>
        <table className='table'>
            <thead>
                <tr>
                    <th>College Name</th>
                    <th>Degree</th>
                    <th className='hide-sm'>FOS</th>
                    <th className='hide-sm'>Year</th>
                </tr>
            </thead>
            <tbody>{educations}</tbody>
        </table>
        </>
    )
}
Education.propTypes = {
    education: PropTypes.array.isRequired,
    deleteEducation:PropTypes.func.isRequired
}

export default connect(null,{deleteEducation})(Education);