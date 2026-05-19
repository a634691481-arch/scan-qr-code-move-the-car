'use strict';
let vk = uniCloud.vk;

const DB_NAME = 'car-info';
const CONTACT_HISTORY_DB = 'contact-history';

const cloudObject = {
	isCloudObject: true,

	_before: async function() {
		vk = this.vk;
	},

	_after: async function(options) {
		let { err, res } = options;
		if (err) {
			if (err instanceof Error) {
				return;
			}
			return err;
		}
		return res;
	},


	getOwnerByPlate: async function(data) {
		let res = { code: 0, msg: '' };
		let { plate } = data;

		if (!plate || plate.length < 7) {
			return { code: -1, msg: '请输入正确的车牌号' };
		}

		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate: plate.toUpperCase() }
		});

		if (!carInfo) {
			return { code: -1, msg: '未找到该车辆信息' };
		}

		res.data = {
			plate: carInfo.plate,
			carDesc: carInfo.carDesc || '',
			phone: carInfo.phone || '',
			subPhone: carInfo.subPhone || '',
			note: carInfo.note || '',
			ownerName: carInfo.ownerName || '',
			hidePhone: carInfo.hidePhone || false,
			pushToken: carInfo.pushToken || '',
		};

		return res;
	},

	getOwnerByScan: async function(data) {
		let res = { code: 0, msg: '' };
		let { plate, phone } = data;

		if (!plate || !phone) {
			return { code: -1, msg: '扫码数据不完整' };
		}

		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate: plate.toUpperCase() }
		});

		if (!carInfo || carInfo.phone !== phone) {
			return { code: -1, msg: '未找到该车辆信息' };
		}

		res.data = {
			plate: carInfo.plate,
			carDesc: carInfo.carDesc || '',
			phone: carInfo.phone,
			subPhone: carInfo.subPhone || '',
			note: carInfo.note || '',
			ownerName: carInfo.ownerName || '',
			hidePhone: carInfo.hidePhone || false,
			pushToken: carInfo.pushToken || '',
		};

		return res;
	},

	getMyCarInfo: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid }
		});

		if (!carInfo) {
			res.data = null;
			return res;
		}

		res.data = {
			_id: carInfo._id,
			plate: carInfo.plate,
			carDesc: carInfo.carDesc || '',
			phone: carInfo.phone || '',
			note: carInfo.note || '',
			ownerName: carInfo.ownerName || '',
			hidePhone: carInfo.hidePhone || false,
			allowVoiceCall: carInfo.allowVoiceCall !== false,
			receiveNotify: carInfo.receiveNotify !== false,
			pushToken: carInfo.pushToken || '',
		};

		return res;
	},

	saveCarInfo: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid, plate, phone, subPhone, carDesc, note, ownerName, hidePhone, allowVoiceCall, receiveNotify, pushToken } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}
		if (!plate || plate.length < 7) {
			return { code: -1, msg: '请输入完整的车牌号' };
		}
		if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
			return { code: -1, msg: '请输入正确的手机号' };
		}

		plate = plate.toUpperCase();

		// 查询当前用户是否已有车辆记录
		let myCar = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid }
		});

		// 查询该车牌是否已被其他用户绑定
		let plateOwner = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate }
		});

		if (plateOwner && plateOwner.uid !== uid) {
			return { code: -1, msg: '该车牌号已被其他用户绑定' };
		}

		let dataJson = {
			uid,
			plate,
			phone,
			subPhone: subPhone || '',
			carDesc: carDesc || '',
			note: note || '',
			ownerName: ownerName || '',
			hidePhone: hidePhone === true,
			receiveNotify: receiveNotify !== false,
			pushToken: pushToken || '',
		};

		if (myCar) {
			await vk.baseDao.updateById({
				dbName: DB_NAME,
				id: myCar._id,
				dataJson,
			});
			res.msg = '更新成功';
		} else {
			let id = await vk.baseDao.add({
				dbName: DB_NAME,
				dataJson
			});
			res.msg = '保存成功';
			res.id = id;
		}

		return res;
	},

	deleteCarInfo: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		let myCar = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid }
		});

		if (myCar) {
			await vk.baseDao.deleteById({
				dbName: DB_NAME,
				id: myCar._id
			});
			res.msg = '删除成功';
		} else {
			res.msg = '车辆信息不存在';
		}

		return res;
	},

	sendMoveCarNotify: async function(data) {
		let res = { code: 0, msg: '' };
		let { plate, token } = data;

		if (!plate) {
			return { code: -1, msg: '车牌号不能为空' };
		}
		if (!token) {
			return { code: -1, msg: '推送token不能为空' };
		}

		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate: plate.toUpperCase() }
		});
		if (!carInfo) {
			return { code: -1, msg: '未找到该车辆信息' };
		}

		try {
			let notifyRes = await uniCloud.httpclient.request('http://www.pushplus.plus/send', {
				method: 'POST',
				data: {
					token: token,
					title: '挪车提醒',
					content: `您好，有人需要联系您挪车。\n车牌号：${carInfo.plate}\n请尽快处理，谢谢配合！`,
					template: 'txt',
					channel: 'wechat',
				},
				dataType: 'json',
				timeout: 10000,
			});

			if (notifyRes.status === 200 && notifyRes.data && notifyRes.data.code === 200) {
				res.msg = '通知发送成功';
			} else {
				res.code = -1;
				res.msg = (notifyRes.data && notifyRes.data.msg) || '推送服务异常';
			}
		} catch (err) {
			res.code = -1;
			res.msg = '推送请求失败';
		}

		return res;
	},

	addContactHistory: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid, plate, contactType, ownerPhone } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}
		if (!plate) {
			return { code: -1, msg: '车牌号不能为空' };
		}

		await vk.baseDao.add({
			dbName: CONTACT_HISTORY_DB,
			dataJson: {
				uid,
				plate: plate.toUpperCase(),
				contactType: contactType || 'phone',
				ownerPhone: ownerPhone || '',
			},
		});

		res.msg = '记录成功';
		return res;
	},

	getContactHistory: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid, pageIndex = 1, pageSize = 20 } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		let listRes = await vk.baseDao.select({
			dbName: CONTACT_HISTORY_DB,
			pageIndex,
			pageSize,
			whereJson: { uid },
			sortArr: [{ name: '_add_time', type: 'desc' }],
			getCount: true,
		});

		res.data = {
			rows: listRes.rows || [],
			total: listRes.total || 0,
			pageIndex: listRes.pagination?.pageIndex || pageIndex,
			pageSize: listRes.pagination?.pageSize || pageSize,
		};
		return res;
	},

	deleteContactHistory: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid, id } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}
		if (!id) {
			return { code: -1, msg: '记录ID不能为空' };
		}

		let record = await vk.baseDao.findById({
			dbName: CONTACT_HISTORY_DB,
			id,
		});

		if (!record || record.uid !== uid) {
			return { code: -1, msg: '记录不存在或无权限' };
		}

		await vk.baseDao.deleteById({
			dbName: CONTACT_HISTORY_DB,
			id,
		});

		res.msg = '删除成功';
		return res;
	},

	clearContactHistory: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		await vk.baseDao.del({
			dbName: CONTACT_HISTORY_DB,
			whereJson: { uid },
		});

		res.msg = '清空成功';
		return res;
	},
};

module.exports = cloudObject;
