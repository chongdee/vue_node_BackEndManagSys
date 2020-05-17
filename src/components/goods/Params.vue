<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 选择商品分类 -->
      <el-row class="cate-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          >
          </el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>

                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态参数 -->
        <el-tab-pane label="静态参数" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
             <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>

                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },

      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // tabs被激活的页签名称
      activeName: "many",
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加参数对话框显示隐藏
      addDialogVisible: false,
      // 添加参数表单数据对象
      addForm: {},
      // 添加表单验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },

      // 控制编辑对话框显示隐藏
      editDialogVisible: false,
      // 编辑表单数据对象
      editForm: {},
      // 编辑表单验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    // 如果添加属性按钮需要被禁用，使用此计算属性
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }

      return false;
    },

    // 选择三级分类的Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }

      return null;
    },

    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  },
  methods: {
    /*------------------- 发起网络请求 -------------------------*/
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }

      this.cateList = res.data;
    },

    /*------------------- 事件监听 -------------------------*/
    // 级联选择框选项变化触发的函数
    async handleChange() {
      this.getParamsData();
    },
    // tabs 页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },

    // 获取参数列表
    async getParamsData() {
      // console.log(this.selectedCateKeys);
      // 数组长度不等于3，说明不是选三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData=[]
        this.onlyTableData=[]
        return;
      }

      // 根据所选分类Id, 和当前tabs页签激活状态activeName获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败！");
      }

      res.data.forEach(item => {
        // 添加参数时对新添加参数没有属性值做处理
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];

        // 控制文本框的显示隐藏
        item.inputVisible = false; //解决参数属性input联动bug
        // 文本框中输入的值
        item.inputValue = "";
      });
      console.log(res.data);
      // 判断数据保存在动态参数 还是静态参数
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 监听添加参数对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    // 点击确定按钮
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );

        if (res.meta.status !== 201) {
          this.$message.error("添加参数失败！");
        }

        this.$message.success("添加参数成功！");
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 编辑弹出对话框事件
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }
      this.editForm = res.data;

      this.editDialogVisible = true;
    },
    // 重置编辑表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击确定按钮，修改参数信息
    async editParams() {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
        {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("修改参数失败！");
      }
      this.$message.success("修改参数成功！");
      this.getParamsData();
      this.editDialogVisible = false;
    },
    // 删除按钮，根据Id删除参数信息
    async removeParams(attr_id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
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

      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败！");
      }

      this.$message.success("删除参数成功！");
      this.getParamsData();
    },
    // 输入框按回车键或失去焦点触发事件
   async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }

      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;

      // 提交数据更新数据库
      this.putAttrVals(row)

    },
    // 点击按钮显示输入文本款
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 点击tag关闭触发事件
    handleClose(i, row){
      row.attr_vals.splice(i,1)

      // 提交数据更新数据库
      this.putAttrVals(row)
      
    },
/*-------------------------- 函数封装 ---------------------------*/ 
    // attr_Vals更新提交数据库封装
    async putAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败！");
      }

      this.$message.success("修改参数项成功！");
    }
  }
};
</script>

<style lang="less" scoped>
.cate-opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
