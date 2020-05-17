<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showDialogAddr"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showDialogProgress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="AddressDialogVisible"
      width="50%"
      @close="addressClosed"
    >
      <!-- 表单 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <!-- <el-input v-model="addressForm.address1"></el-input> -->
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AddressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
      @close="progressClosed"
    >
    <!-- 时间线 -->
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";

export default {
  name: "Order",
  data() {
    return {
      queryParams: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      AddressDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressFormRules: {
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" }
        ]
      },
      // 数据源：options
      cityData,
      progressVisible: false,
      progressInfo: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    /*----------------------------- 发起网络请求 --------------------------*/

    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryParams
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败！");
      }

      this.$message.success("获取订单列表成功！");
      // console.log(res.data);
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },

    /*----------------------------- 事件监听 --------------------------*/
    // 监听页面条数改变触发的函数
    handleSizeChange(newSize) {
      this.queryParams.pagesize = newSize;
      this.getOrderList();
    },

    // 监听页面页码改变触发的函数
    handleCurrentChange(newPage) {
      this.queryParams.pagenum = newPage;
      this.getOrderList();
    },

    // 弹出修改地址对话框
    showDialogAddr() {
      this.AddressDialogVisible = true;
    },

    // 修改地址对话框关闭事件
    addressClosed() {
      this.$refs.addressFormRef.resetFields();
    },

    async showDialogProgress() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");

      if (res.meta.status !== 200) {
        return this.$message.error("获取物流进度失败！");
      }

      this.progressInfo = res.data;
      console.log(this.progressInfo);

      // this.$message.success("获取物流进度成功！")
      this.progressVisible = true;
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
