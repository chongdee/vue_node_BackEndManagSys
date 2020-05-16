<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-button type="primary" @click="showAddCateDialog"
          >添加分类</el-button
        >
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text=""
        border
        class="tree-table"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:#5b9cff"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scoped">
          <el-tag size="mini" v-if="scoped.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scoped.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="operate" slot-scope="scoped">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogclosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <!-- props 指定级联配置对象-->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      queryParams: {
        type: 3,
        // 页数
        pagenum: 1,
        // 每页显示多少条
        pagesize: 5
      },
      // 数据总条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // type表示当前列设置为模板列
          type: "template",
          //  表示当前这一列使用模板名称
          template: "isok"
        },
        {
          label: "排序",
          // type表示当前列设置为模板列
          type: "template",
          //  表示当前这一列使用模板名称
          template: "order"
        },
        {
          label: "操作",
          // type表示当前列设置为模板列
          type: "template",
          //  表示当前这一列使用模板名称
          template: "operate"
        }
      ],

      // 控制添加分类对话框的显示隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" }
        ]
      },

      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },

      // 选中的父级分类的Id值数组
      selectedKeys: []
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    /*------------------ 发送网络请求 -------------------*/
    // 获取分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryParams
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }

      // console.log(res.data);

      // 获取数据保存到data属性cateList中
      this.cateList = res.data.result;
      // 获取数据保存到data属性total中
      this.total = res.data.total;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败！");
      }

      // console.log(res.data);
      this.parentCateList = res.data;
    },

    /*------------------ 事件监听 -------------------*/
    // 监听pagesize条数变化
    handleSizeChange(newSize) {
      this.queryParams.pagesize = newSize;
      this.getCateList();
    },

    // 监听 pangenum 页数改变
    handleCurrentChange(newPage) {
      this.queryParams.pagenum = newPage;
      this.getCateList();
    },

    //  点击添加分类按钮弹出对话框
    showAddCateDialog() {
      // 获取父级分类数据调用
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 选择项发生变化触发函数
    parentCateChanged() {
      console.log(this.selectedKeys);

      // 如果 selectedKeys length大于0，说明选择父级分类
      // 否则说明没有选择任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];

        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确定，添加新的分类
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid=>{
        if(!valid) return
        const {data:res}=await this.$http.post('categories', this.addCateForm)

        if(res.meta.status!=201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },

    // 监听对话框关闭事件，重置表单数据
    addCateDialogclosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    }
  }
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
</style>
