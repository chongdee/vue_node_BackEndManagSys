<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryParams.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="90px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="90px"
        ></el-table-column>
        <el-table-column label="创建时间" width="200px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
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
  </div>
</template>

<script>
export default {
  name: "List",
  data() {
    return {
      queryParams: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    /*----------------------------- 发起网络请求 --------------------------*/
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryParams
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }

      this.$message.success("获取商品列表成功！");
      console.log(res.data);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },

    /*----------------------------- 事件监听 --------------------------*/
    // 监听页面条数改变触发的函数
    handleSizeChange(newSize) {
      this.queryParams.pagesize = newSize;
      this.getGoodsList();
    },

    // 监听页面页码改变触发的函数
    handleCurrentChange(newPage) {
      this.queryParams.pagenum = newPage;
      this.getGoodsList();
    },

    // 根据商品Id删除
    async removeById(id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmRes !== "confirm") {
        return this.$message.info("已取消删除！");
      }

      const { data: res } = await this.$http.delete(`goods/${id}`);

      if (res.meta.status !== 200) {
        return this.$message.error("删除失败！");
      }

      this.$message.success("删除成功！");

      this.getGoodsList();
    },
    goAddPage(){
      this.$router.push('/goods/add')
    }
  }
};
</script>

<style lang="scss" scoped></style>
