'use strict';
let vk = uniCloud.vk;

const DB_NAME = 'car-info';
const CONTACT_HISTORY_DB = 'contact-history';
const FEEDBACK_DB = 'feedback';

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

	// 兼容旧接口 - 返回默认车辆
	getMyCarInfo: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		// 先查默认车辆
		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid, isDefault: true }
		});

		// 没有默认车辆，取该用户第一辆车
		if (!carInfo) {
			let listRes = await vk.baseDao.select({
				dbName: DB_NAME,
				whereJson: { uid },
				pageSize: 1,
				sortArr: [{ name: '_add_time', type: 'desc' }],
			});
			carInfo = listRes.rows && listRes.rows[0] ? listRes.rows[0] : null;
		}

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

	// 获取用户的所有车辆列表
	getMyCarList: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		let listRes = await vk.baseDao.select({
			dbName: DB_NAME,
			whereJson: { uid },
			pageSize: -1,
			sortArr: [{ name: 'isDefault', type: 'desc' }, { name: '_add_time', type: 'desc' }],
		});

		let rows = listRes.rows || [];

		if (rows.length === 0) {
			res.data = {
				carList: [],
				phone: '',
				subPhone: '',
				note: '',
				ownerName: '',
				hidePhone: false,
				receiveNotify: true,
				pushToken: '',
			};
			return res;
		}

		// 取第一条作为基础信息（所有车辆共享用户联系信息）
		let baseInfo = rows[0];

		res.data = {
			carList: rows.map(car => ({
				_id: car._id,
				plate: car.plate,
				carDesc: car.carDesc || '',
				isDefault: car.isDefault || false,
			})),
			phone: baseInfo.phone || '',
			subPhone: baseInfo.subPhone || '',
			note: baseInfo.note || '',
			ownerName: baseInfo.ownerName || '',
			hidePhone: baseInfo.hidePhone || false,
			receiveNotify: baseInfo.receiveNotify !== false,
			pushToken: baseInfo.pushToken || '',
		};

		return res;
	},

	// 兼容旧接口 - 保存单辆车
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

		// 查询该车牌是否已被其他用户绑定
		let plateOwner = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { plate }
		});

		if (plateOwner && plateOwner.uid !== uid) {
			return { code: -1, msg: '该车牌号已被其他用户绑定' };
		}

		// 查询当前用户是否已有这辆车
		let myCar = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid, plate }
		});

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
			res.id = myCar._id;
		} else {
			// 检查该用户是否已有默认车辆，如果没有则设为默认
			let hasDefault = await vk.baseDao.findByWhereJson({
				dbName: DB_NAME,
				whereJson: { uid, isDefault: true }
			});
			if (!hasDefault) {
				dataJson.isDefault = true;
			}

			let id = await vk.baseDao.add({
				dbName: DB_NAME,
				dataJson
			});
			res.msg = '保存成功';
			res.id = id;
		}

		return res;
	},

	// 保存车辆列表（多辆车）
	saveCarList: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid, carList, phone, subPhone, note, ownerName, hidePhone, receiveNotify, pushToken } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}
		if (!carList || !Array.isArray(carList) || carList.length === 0) {
			return { code: -1, msg: '请至少添加一辆车' };
		}
		if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
			return { code: -1, msg: '请输入正确的手机号' };
		}

		// 过滤有效车辆
		let validCars = carList.filter(car => car.plate && car.plate.length >= 7);
		if (validCars.length === 0) {
			return { code: -1, msg: '请至少输入一辆车的完整车牌号' };
		}

		// 检查车牌重复
		let plateSet = new Set();
		for (let car of validCars) {
			let p = car.plate.toUpperCase();
			if (plateSet.has(p)) {
				return { code: -1, msg: '车牌号不能重复' };
			}
			plateSet.add(p);
		}

		// 检查车牌是否被其他用户绑定
		for (let car of validCars) {
			let plateOwner = await vk.baseDao.findByWhereJson({
				dbName: DB_NAME,
				whereJson: { plate: car.plate.toUpperCase() }
			});
			if (plateOwner && plateOwner.uid !== uid) {
				return { code: -1, msg: `车牌号 ${car.plate} 已被其他用户绑定` };
			}
		}

		// 获取该用户当前所有车辆
		let existingRes = await vk.baseDao.select({
			dbName: DB_NAME,
			whereJson: { uid },
			pageSize: -1,
		});
		let existingCars = existingRes.rows || [];
		let existingMap = new Map();
		existingCars.forEach(car => existingMap.set(car._id, car));

		let submittedIds = new Set();
		let carIds = [];

		// 确保至少有一辆默认车辆
		let hasDefault = validCars.some(c => c.isDefault);
		if (!hasDefault && validCars.length > 0) {
			validCars[0].isDefault = true;
		}

		for (let i = 0; i < validCars.length; i++) {
			let car = validCars[i];
			let plate = car.plate.toUpperCase();
			let dataJson = {
				uid,
				plate,
				phone,
				subPhone: subPhone || '',
				carDesc: car.carDesc || '',
				note: note || '',
				ownerName: ownerName || '',
				hidePhone: hidePhone === true,
				receiveNotify: receiveNotify !== false,
				pushToken: pushToken || '',
				isDefault: car.isDefault === true,
			};

			if (car._id && existingMap.has(car._id)) {
				// 更新已有车辆
				await vk.baseDao.updateById({
					dbName: DB_NAME,
					id: car._id,
					dataJson,
				});
				submittedIds.add(car._id);
				carIds.push(car._id);
			} else {
				// 检查是否已有相同车牌的记录（可能_id未传）
				let existByPlate = existingCars.find(ec => ec.plate === plate);
				if (existByPlate) {
					await vk.baseDao.updateById({
						dbName: DB_NAME,
						id: existByPlate._id,
						dataJson,
					});
					submittedIds.add(existByPlate._id);
					carIds.push(existByPlate._id);
				} else {
					let id = await vk.baseDao.add({
						dbName: DB_NAME,
						dataJson,
					});
					submittedIds.add(id);
					carIds.push(id);
				}
			}
		}

		// 删除用户提交列表中不存在的车辆
		for (let existing of existingCars) {
			if (!submittedIds.has(existing._id)) {
				await vk.baseDao.deleteById({
					dbName: DB_NAME,
					id: existing._id,
				});
			}
		}

		res.msg = '保存成功';
		res.data = { carIds };
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

	generateMoveCarQRCode: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		// 先查默认车辆
		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid, isDefault: true }
		});

		// 没有默认车辆，取该用户第一辆车
		if (!carInfo) {
			let listRes = await vk.baseDao.select({
				dbName: DB_NAME,
				whereJson: { uid },
				pageSize: 1,
				sortArr: [{ name: '_add_time', type: 'desc' }],
			});
			carInfo = listRes.rows && listRes.rows[0] ? listRes.rows[0] : null;
		}

		if (!carInfo) {
			return { code: -1, msg: '请先设置车辆信息' };
		}

		let scene = `uid=${uid}`;
		if (scene.length > 32) {
			return { code: -1, msg: '用户标识过长' };
		}

		let qrRes = await vk.openapi.weixin.wxacode.getUnlimited({
			page: 'pages/index/index',
			scene: scene,
			check_path: false,
			width: 430,
			is_hyaline: false,
		});

		if (typeof qrRes === 'object' && qrRes.code) {
			return qrRes;
		}

		try {
			let base64 = Buffer.from(qrRes, 'binary').toString('base64');
			res.data = {
				base64: `data:image/png;base64,${base64}`,
				plate: carInfo.plate,
				phone: carInfo.phone,
				note: carInfo.note || '',
			};
			return res;
		} catch (err) {
			return {
				code: -1,
				msg: '生成小程序码失败',
				err: { message: err.message, stack: err.stack },
			};
		}
	},

	getOwnerByUid: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '参数错误' };
		}

		// 先查默认车辆
		let carInfo = await vk.baseDao.findByWhereJson({
			dbName: DB_NAME,
			whereJson: { uid, isDefault: true }
		});

		// 没有默认车辆，取该用户第一辆车
		if (!carInfo) {
			let listRes = await vk.baseDao.select({
				dbName: DB_NAME,
				whereJson: { uid },
				pageSize: 1,
				sortArr: [{ name: '_add_time', type: 'desc' }],
			});
			carInfo = listRes.rows && listRes.rows[0] ? listRes.rows[0] : null;
		}

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

	addFeedback: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid, type, content, contact } = data;

		if (!type) {
			return { code: -1, msg: '请选择反馈类型' };
		}
		if (!content || content.trim().length < 5) {
			return { code: -1, msg: '反馈内容至少5个字' };
		}

		await vk.baseDao.add({
			dbName: FEEDBACK_DB,
			dataJson: {
				uid: uid || '',
				type,
				content: content.trim(),
				contact: contact || '',
				status: 'pending',
			},
		});

		res.msg = '提交成功';
		return res;
	},

	// 获取用户使用统计
	getUserStatistics: async function(data) {
		let res = { code: 0, msg: '' };
		let { uid } = data;

		if (!uid) {
			return { code: -1, msg: '用户未登录' };
		}

		// 1. 车辆数量
		let carRes = await vk.baseDao.select({
			dbName: DB_NAME,
			whereJson: { uid },
			pageSize: -1,
		});
		let carList = carRes.rows || [];
		let carCount = carList.length;

		// 2. 我联系他人的次数（作为联系人）
		let contactRes = await vk.baseDao.select({
			dbName: CONTACT_HISTORY_DB,
			whereJson: { uid },
			pageSize: -1,
		});
		let myContacts = contactRes.rows || [];
		let contactCount = myContacts.length;

		// 3. 他人联系我的次数（通过车牌号匹配）
		let myPlates = carList.map(c => c.plate).filter(Boolean);
		let beContactedCount = 0;
		if (myPlates.length > 0) {
			let beContactedRes = await vk.baseDao.select({
				dbName: CONTACT_HISTORY_DB,
				whereJson: {
					plate: { $in: myPlates },
					uid: { $ne: uid },
				},
				pageSize: -1,
			});
			beContactedCount = (beContactedRes.rows || []).length;
		}

		// 4. 本月联系次数
		let now = new Date();
		let monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		let monthContacts = myContacts.filter(r => r._add_time && new Date(r._add_time) >= monthStart);
		let monthContactCount = monthContacts.length;

		// 5. 本周联系次数
		let dayOfWeek = now.getDay() || 7;
		let weekStart = new Date(now);
		weekStart.setDate(now.getDate() - dayOfWeek + 1);
		weekStart.setHours(0, 0, 0, 0);
		let weekContacts = myContacts.filter(r => r._add_time && new Date(r._add_time) >= weekStart);
		let weekContactCount = weekContacts.length;

		// 6. 最近7天每日联系趋势
		let dailyTrend = [];
		for (let i = 6; i >= 0; i--) {
			let d = new Date(now);
			d.setDate(d.getDate() - i);
			d.setHours(0, 0, 0, 0);
			let nextD = new Date(d);
			nextD.setDate(nextD.getDate() + 1);
			let count = myContacts.filter(r => {
				if (!r._add_time) return false;
				let t = new Date(r._add_time);
				return t >= d && t < nextD;
			}).length;
			let label = `${d.getMonth() + 1}/${d.getDate()}`;
			dailyTrend.push({ label, count });
		}

		// 7. 最常联系的车牌 TOP5
		let plateCountMap = {};
		myContacts.forEach(r => {
			let p = r.plate || '未知';
			plateCountMap[p] = (plateCountMap[p] || 0) + 1;
		});
		let topPlates = Object.entries(plateCountMap)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([plate, count]) => ({ plate, count }));

		res.data = {
			carCount,
			contactCount,
			beContactedCount,
			monthContactCount,
			weekContactCount,
			dailyTrend,
			topPlates,
		};
		return res;
	},
};

module.exports = cloudObject;
