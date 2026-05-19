<template>
  <view>
    <yy-paging v-model="state.dataList" @query="queryList" ref="paging" @scroll="scroll" v-bind="pagingConfig">
      <template #top>
        <!-- 统计卡片 -->
        <view class="stat-card" :style="statCardStyle">
          <view class="stat-item">
            <view class="stat-icon-wrap">
              <yy-icon name="ri:phone-line" size="22" color="#ffffff" />
            </view>
            <text class="stat-num" :style="statNumberStyle">{{ totalCount }}</text>
            <text class="stat-label">联系次数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-icon-wrap">
              <yy-icon name="ri:car-line" size="22" color="#ffffff" />
            </view>
            <text class="stat-num" :style="statNumberStyle">{{ uniquePlateCount }}</text>
            <text class="stat-label">联系车辆</text>
          </view>
        </view>
      </template>

      <view class="page-content">
        <!-- 列表头部 -->
        <view v-if="state.dataList.length > 0" class="list-header">
          <text class="list-header-title">联系记录</text>
          <text class="list-header-clear" @click="clearAll">清空全部</text>
        </view>

        <!-- 历史列表 -->
        <view v-if="state.dataList.length > 0" class="history-list">
          <view
            v-for="(item, index) in state.dataList"
            :key="item._id"
            class="history-item"
            @longpress="showDeleteMenu(item)"
          >
            <view class="history-icon" :style="{ background: `${uni.$u.color.primary}15` }">
              <yy-icon name="ri:car-line" size="20" :color="uni.$u.color.primary" />
            </view>
            <view class="history-content">
              <view class="history-row">
                <text class="history-plate">{{ item.plate }}</text>
                <text class="history-type">{{ formatType(item.contactType) }}</text>
              </view>
              <text class="history-time">{{ formatTime(item._add_time) }}</text>
            </view>
            <view class="history-delete" @click.stop="deleteItem(item)">
              <yy-icon name="ri:delete-bin-line" size="16" color="#ef4444" />
            </view>
          </view>
        </view>
      </view>
    </yy-paging>
  </view>
</template>

<script setup>
  const pagingConfig = ref({
    auto: true,
    refresherEnabled: true,
    showRefresherWhenReload: false,
    loadingMoreEnabled: true,
    showTabbar: false,
    hideNav: false,
    showNavBack: true,
    navTitle: '联系历史',
    color: uni.$u.color.primary,
  })

  const state = ref({
    isScroll: false,
    dataList: [],
  })

  const paging = ref()

  const totalCount = ref(0)
  const uniquePlateCount = ref(0)

  const statCardStyle = computed(() => ({
    background: `linear-gradient(135deg, ${uni.$u.color.primary} 0%, ${uni.$u.color.primaryDark} 100%)`,
    // boxShadow: `0 8px 24px ${uni.$u.color.primary}40`,
  }))

  const statNumberStyle = computed(() => ({
    color: '#ffffff',
  }))

  function scroll(e) {
    state.value.isScroll = e.detail.scrollTop > 0
  }

  async function queryList(page, limit) {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) {
      vk.toast('请先登录')
      return
    }

    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.getContactHistory',
        data: { uid, pageIndex: page, pageSize: limit },
        needAlert: false,
      })

      if (res.code === 0 && res.data) {
        totalCount.value = res.data.total || 0
        const plates = new Set((res.data.rows || []).map(item => item.plate))
        uniquePlateCount.value = plates.size

        paging.value?.complete(res.data.rows)
      } else {
        paging.value?.complete(false)
      }
    } catch (err) {
      paging.value?.complete(false)
      vk.toast('加载失败')
    }
  }

  // 删除单条记录
  async function deleteItem(item) {
    vk.confirm({
      title: '删除记录',
      content: `确定删除对 ${item.plate} 的联系记录吗？`,
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#ef4444',
      success: async res => {
        if (res.confirm) {
          await doDelete(item._id)
        }
      },
    })
  }

  // 长按菜单
  function showDeleteMenu(item) {
    uni.showActionSheet({
      itemList: ['删除该记录'],
      itemColor: '#ef4444',
      success: async res => {
        if (res.tapIndex === 0) {
          await doDelete(item._id)
        }
      },
    })
  }

  async function doDelete(id) {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) {
      vk.toast('请先登录')
      return
    }

    vk.showLoading({ title: '删除中...', mask: true })
    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.deleteContactHistory',
        data: { uid, id },
        needAlert: false,
      })
      vk.hideLoading()
      if (res.code === 0) {
        vk.toast('删除成功')
        paging.value?.reload()
      } else {
        vk.toast(res.msg || '删除失败')
      }
    } catch (err) {
      vk.hideLoading()
      vk.toast('删除失败')
    }
  }

  // 清空全部
  function clearAll() {
    vk.confirm({
      title: '清空记录',
      content: '确定清空所有联系历史记录吗？此操作不可恢复。',
      confirmText: '清空',
      cancelText: '取消',
      confirmColor: '#ef4444',
      success: async res => {
        if (res.confirm) {
          await doClearAll()
        }
      },
    })
  }

  async function doClearAll() {
    const uid = vk.getStorageSync('uni_id_token')
    if (!uid) {
      vk.toast('请先登录')
      return
    }

    vk.showLoading({ title: '清空中...', mask: true })
    try {
      const res = await vk.callFunction({
        url: 'client/pub_index.clearContactHistory',
        data: { uid },
        needAlert: false,
      })
      vk.hideLoading()
      if (res.code === 0) {
        vk.toast('清空成功')
        totalCount.value = 0
        uniquePlateCount.value = 0
        paging.value?.reload()
      } else {
        vk.toast(res.msg || '清空失败')
      }
    } catch (err) {
      vk.hideLoading()
      vk.toast('清空失败')
    }
  }

  function formatType(type) {
    const map = {
      phone: '电话联系',
      notify: '推送通知',
      scan: '扫码联系',
    }
    return map[type] || '电话联系'
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}`
  }
</script>

<style lang="scss" scoped>
  .page-content {
    padding-bottom: 24rpx;
  }

  .stat-card {
    margin: 12px 16px 0;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .stat-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  .stat-num {
    font-size: 28px;
    font-weight: 700;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.25);
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 16px 16px 16px;
  }

  .list-header-title {
    font-size: 15px;
    font-weight: 600;
    color: #374151;
  }

  .list-header-clear {
    font-size: 13px;
    color: #ef4444;

    &:active {
      opacity: 0.7;
    }
  }

  .history-list {
    margin: 0 16px;
    background: #ffffff;
    border-radius: 20px;
    padding: 8px 0;
    // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f9fafb;
    }
  }

  .history-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .history-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .history-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .history-plate {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    letter-spacing: 1px;
  }

  .history-type {
    font-size: 12px;
    color: var(--u-type-primary);
    background: var(--u-type-primary-light);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .history-time {
    font-size: 12px;
    color: #9ca3af;
  }

  .history-delete {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;

    &:active {
      background: #fef2f2;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 0;
  }

  .empty-icon-wrap {
    width: 80px;
    height: 80px;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .empty-desc {
    font-size: 13px;
    color: #9ca3af;
  }
</style>
