<template>
  <div class="page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vertcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeById(scope.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['bdbottom', i2 === 0 ? 'bdtop' : '', 'vertcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allow2Rights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRolesDialogVisible"
      width="50%"
      @close="editRolesDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      rolesList: [],

      // 控制分配权限对话框显示隐藏
      setRightDialogVisible: false,

      // 所有权限数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认选中节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",
      // 添加角色对话框表单数据对象
      addRolesForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加角色对话框表单验证规则对象
      addRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      // 控制添加角色对话框显示隐藏
      addRolesDialogVisible: false,

      /* ---------修改角色对话框---------- */

      editRolesDialogVisible: false,
      editRolesForm: {},
      editRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    /* ----------------------------- 发送网络请求 ---------------------------------- */
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        this.$message.error("获取角色列表失败！");
      }

      this.rolesList = res.data;
    },

    // 根据ID删除对应的权限
    async removeById(role, rightId) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmRes !== "confirm") {
        return this.$message.info("取消了删除！");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }

      // this.getrolesList();// 重新获取数据会刷新页面

      role.children = res.data;
    },

    // 设置分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }

      // 获取到的权限数据保存到data中
      this.rightsList = res.data;

      // 递归获取三级节点Id
      this.getLeafKeys(role, this.defKeys);

      this.setRightDialogVisible = true;
    },

    // 通过递归获取角色下所有三级节点权限id,保存到defkeys中
    getLeafKeys(node, arr) {
      // 当前节点不包含children属性就是三级权限
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },

    // 关闭对话框重置defKeys数据
    setRightDialogClosed() {
      this.defKeys = [];
    },

    // 点击确定按钮分配权限
    async allow2Rights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      // console.log(keys);
      const idStr = keys.join(",");

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功！");

      this.getRolesList();

      this.setRightDialogVisible = false;
    },

    /* ----------------------------- 事件监听 ---------------------------------- */

    // 关闭添加角色对话框重置验证规则
    addRolesDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },
    // 点击对话框确定按钮触发添加角色事件
    addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        console.log(res);

        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功！");

        // 关闭添加角色对话框
        this.addRolesDialogVisible = false;

        // 重新获取角色列表
        this.getRolesList();
      });
    },

    // 点击修改角色按钮事件
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败！");
      }
      this.editRolesForm = res.data;

      this.editRolesDialogVisible = true;
    },

    // 修改角色对话框的关闭事件，重置表单验证规则
    editRolesDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    // 点击修改角色对话框确定按钮触发的事件
    editRoles() {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return;

        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        );
        console.log(res);

        if (res.meta.status !== 200) {
          return this.$message.error("更新角色失败！");
        }
        this.$message.success("更新角色成功！");

        // 关闭添加角色对话框
        this.editRolesDialogVisible = false;

        // 重新获取角色列表
        this.getRolesList();
      });
    },

    // 根据Id删除角色
    async removeRolesById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除！");
      }

      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.info("删除角色失败！");
      }

      this.$message.success("删除角色成功！");
      this.getRolesList();
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 8px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}

.vertcenter {
  display: flex;
  align-items: center;
}
</style>
