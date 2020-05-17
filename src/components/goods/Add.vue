<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条 -->
      <!-- 'activeIndex - 0' 转为数字类似 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片上传到后台的API地址 -->
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本 -->
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addBtn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "Add",
  data() {
    return {
      activeIndex: "0",
      // 添加商品表单对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 商品详情介绍
        goods_introduce: "",
        attrs: []
      },
      // 表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联对象
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 上传图片携带请求头token
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewPath: "",
      previewVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    // 计算属性获取三级分类Id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }

      return null;
    }
  },
  methods: {
    /* ------------------------------ 网络请求 --------------------------------- */
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败！");
      }

      this.cateList = res.data;
    },
    /* ------------------------------ 事件监听 --------------------------------- */

    // 级联选择项变化触发的事件
    handleChange() {
      // console.log(this.addForm.goods_cat);

      // 如果没有选三级分类，清空goods_cat
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      console.log(this.addForm.goods_cat);
    },
    // tab切换钩子函数，条件不满足禁止切换
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName,oldActiveName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },

    // tabClick触发tabs点击事件
    async tabClick() {
      // console.log(this.activeIndex);
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败！");
        }

        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        console.log(res.data);
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性列表失败！");
        }

        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 上传图片预览事件
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 上传图片移除事件
    handleRemove(file) {
      // console.log(file);
      // 获取临时路径
      const filePath = file.response.data.tmp_path;
      // 找到相同图片的索引值
      const idx = this.addForm.pics.findIndex(item => {
        item.pic === filePath;
      });
      this.addForm.pics.splice(idx, 1);
    },
    // 监听图片上传成功事件
    handleSuccess(res) {
      // console.log(res);
      const picInfo = {
        pic: res.data.tmp_path
      };
      // 上传成功后服务器返回的临时路径保存到data,addForm中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 添加商品
    addGoods() {
      // console.log(this.addForm);
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }

        // 由于addForm太多数据绑定，所以对此做深拷贝
        const copyAddForm = _.cloneDeep(this.addForm);
        copyAddForm.goods_cat = copyAddForm.goods_cat.join(",");

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        copyAddForm.attrs = this.addForm.attrs;
        console.log(copyAddForm);

        // 发起请求
        // 商品名称必须唯一
        const { data: res } = await this.$http.post("goods", copyAddForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败！");
        }

        this.$message.success("添加商品成功！");
        this.$router.push("/goods");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>
