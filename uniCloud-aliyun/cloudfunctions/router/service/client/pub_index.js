'use strict';
let vk = uniCloud.vk;

const DB_NAME = 'car-info';

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
		let { plate } = data;

		if (!plate) {
			return { code: -1, msg: '车牌号不能为空' };
		}

		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate: plate.toUpperCase() }
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
		let { plate, phone, subPhone, carDesc, note, ownerName, hidePhone, allowVoiceCall, receiveNotify, pushToken } = data;


		if (!plate || plate.length < 7) {
			return { code: -1, msg: '请输入完整的车牌号' };
		}
		if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
			return { code: -1, msg: '请输入正确的手机号' };
		}

		plate = plate.toUpperCase();

		let plateOwner = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate }
		});

		let dataJson = {
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

		if (plateOwner) {
			await vk.baseDao.updateById({
				dbName: DB_NAME,
				id: plateOwner._id,
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
		let { plate } = data;

		if (!plate) {
			return { code: -1, msg: '车牌号不能为空' };
		}

		let plateOwner = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate: plate.toUpperCase() }
		});

		if (plateOwner) {
			await vk.baseDao.deleteById({
				dbName: DB_NAME,
				id: plateOwner._id
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
};

module.exports = cloudObject;
