import React, { Component } from 'react'
import SchoolSelector from '../component/schoolSelector'
import OVDetail from './ovdetail'
import Time from '../component/time'
import AjaxHandler from '../ajax'
import userImg from '../assets/user2.png'

const initilaState = {
	selectedSchool: 'all',
	units:[]
};

export default class OverView extends Component {
	state = initilaState;

	fetchData = (body)=>{
		let resource='/api/statistics/overview'
		const cb=(json)=>{
			if(json.error){
				throw new Error(json.error)
			}else{
				this.setState({
					units: json.data.units
				})
			}
		}
		AjaxHandler.ajax(resource,body,cb)
	}

	componentDidMount(){
		const body={
			startTime: Time.getTodayStart(),
			endTime: Time.getNow()
		}
		
		this.fetchData(body)
	}

	changeSchool=(v)=>{
		this.setState({
			selectedSchool:v 
		})
		const body={
			startTime: Time.getTodayStart(),
			endTime: Time.getNow()
		}
		if(v!=='all'){
			body.schoolId = parseInt(v,10)
		}
		this.fetchData(body)
	}

	render() {
		const {units,selectedSchool} = this.state
		const userData = units&&units.find((r,i)=>(r.type===1))
		const showerOrder = units&&units.find((r,i)=>(r.type===2))
		const drinkerOrder = units&&units.find((r,i)=>(r.type===3))
		const depositAmount = units&&units.find((r,i)=>(r.type===4))
		const cashAmount = units&&units.find((r,i)=>(r.type===5))
		const showerRepair = units&&units.find((r,i)=>(r.type===6))
		const drinkerRepair = units&&units.find((r,i)=>(r.type===7))

		return (
			<div className='overview' >
				<div className='ovHeader'>
					<h1>今日总揽</h1>
					<SchoolSelector selectedSchool={selectedSchool} changeSchool={this.changeSchool} />
				</div>
				<div className='ovContent'>
					<div className='userDetail'>
						<img src={userImg} alt='user' />
						<OVDetail title='今日新增用户' data={userData&&userData.data} direction={userData&&userData.direction} percent={userData&&userData.percent} />
					</div>
					<div className='seperatorLine'></div>
					<div className='detailPanel'>
						<OVDetail title='今日热水器订单' data={showerOrder&&showerOrder.data} direction={showerOrder&&showerOrder.direction} percent={showerOrder&&showerOrder.percent} />
						<OVDetail title='今日饮水机订单' data={drinkerOrder&&drinkerOrder.data} direction={drinkerOrder&&drinkerOrder.direction} percent={drinkerOrder&&drinkerOrder.percent} />
						<OVDetail title='今日充值总额(¥)' data={depositAmount&&depositAmount.data} direction={depositAmount&&depositAmount.direction} percent={depositAmount&&depositAmount.percent} />
						<OVDetail title='今日提现总额(¥)' data={cashAmount&&cashAmount.data} direction={cashAmount&&cashAmount.direction} percent={cashAmount&&cashAmount.percent} />
						<OVDetail title='今日热水器报修' data={showerRepair&&showerRepair.data} direction={showerRepair&&showerRepair.direction} percent={showerRepair&&showerRepair.percent} />
						<OVDetail title='今日饮水机报修' data={drinkerRepair&&drinkerRepair.data} direction={drinkerRepair&&drinkerRepair.direction} percent={drinkerRepair&&drinkerRepair.percent} />
					</div>
				</div>
			</div>
		)
	}
}
