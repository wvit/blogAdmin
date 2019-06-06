<template>
  <div>
    <ul class="agrms-list w600">
      <li class="clearfix">
        <span>博客标题：</span>
        <div>
          <el-input v-model="blogData.title" placeholder="请输入博客标题" clearable></el-input>
        </div>
      </li>
      <li class="clearfix">
        <span>博客类型:</span>
        <div>
          <el-select
            v-model="blogData.model"
            @change="modelChange"
            placeholder="请选择博客类型"
            class="w300"
          >
            <el-option label="工作" :value="1"></el-option>
            <el-option label="生活" :value="2"></el-option>
          </el-select>
        </div>
      </li>
      <li class="clearfix" v-show="blogData.model===1">
        <span>博客标签:</span>
        <div>
          <el-checkbox-group v-model="blogData.tags">
            <ul class="clearfix tag-list">
              <li v-for="(item,index) of blogTag" :key="index">
                <el-checkbox :label="item.tag" class="tag-item">{{item.tag}}</el-checkbox>
                <span class="delete-item icon icon-close" @click="removeTag(item._id)"></span>
              </li>
            </ul>
          </el-checkbox-group>
        </div>
      </li>
      <li class="clearfix" v-show="blogData.model===2">
        <span>博客分类:</span>
        <div>
          <el-select v-model="blogData.classId" placeholder="请选择博客类型" class="w300">
            <el-option
              v-for="(item,index) of blogType"
              :key="index"
              :label="item.tag"
              :value="item._id"
            ></el-option>
          </el-select>
        </div>
      </li>
      <li class="clearfix">
        <span>添加{{tagData.status===1?'标签':'分类'}}:</span>
        <div>
          <el-input
            v-model="tagData.tag"
            :placeholder="`请输入${tagData.status===1?'标签':'分类'}名`"
            class="w300"
          ></el-input>
          <el-button type="primary" class="w100 ml10" @click="addTag">添加</el-button>
        </div>
      </li>
      <li class="clearfix">
        <span>博客内容:</span>
        <div class="quill-editor-wrap">
          <quill-editor :options="editorOption" v-model="blogData.content"></quill-editor>
        </div>
      </li>
    </ul>
    <div class="btn-wrap">
      <el-button type="primary" class="btn" @click="addBlog" round>确认</el-button>
    </div>
  </div>
</template>
<script>
import { Quill } from "vue-quill-editor";
import { container, ImageExtend, QuillWatch } from "quill-image-extend-module";
Quill.register("modules/ImageExtend", ImageExtend);

export default {
  data() {
    return {
      //添加标签分类
      tagData: {
        tag: "",
        status: 1, //1标签 2分类
        type: 0 //0添加 1删除
      },
      blogTag: [], //博客标签
      blogType: [], //博客分类
      //添加博客数据
      blogData: {
        title: "",
        content: "",
        model: 1, //1工作 2生活
        tags: [], //标签
        classId: "", //分类id
        type: 0 //0添加 1修改 2删除
      },
      //富文本配置
      editorOption: {
        modules: {
          ImageExtend: {
            loading: true,
            name: "file",
            action: "/upload",
            response: res => res.data.path
          },
          toolbar: {
            container,
            handlers: {
              image() {
                QuillWatch.emit(this.quill.id);
              }
            }
          }
        }
      },
      editOnOff: false //是否是修改
    };
  },
  //初始化
  beforeMount() {
    this.$utils.store.set("defaultData", this.blogData);
    this.editOnOff = this.$route.path === "/home/blog/list/edit" ? true : false;
    this.getTag(1, "blogTag");
    this.getTag(2, "blogType");
    if (this.editOnOff) {
      const editData = this.$utils.store.get("editData");
      for (let key in this.blogData) {
        this.blogData[key] = editData[key];
      }
      this.blogData.type = 1;
      this.blogData.id = editData._id;
    }
  },
  methods: {
    //获取标签
    getTag(status, listName) {
      this.$axios.get(`/admin/getTags?status=${status}`).then(res => {
        if (res.data.code !== 0) return;
        this[listName] = res.data.data;
      });
    },
    //博客类型改变
    modelChange(model) {
      this.tagData.status = model;
    },
    //添加新闻
    addBlog() {
      const utils = this.$utils;
      if (!utils.judgeNull(this.blogData.title)) {
        utils.showToast({ text: "请输入标题" });
      } else if (this.blogData.model === 1 && this.blogData.tags.length === 0) {
        utils.showToast({ text: "请至少勾选一个标签" });
      } else if (this.blogData.model === 2 && this.blogData.classId === "") {
        utils.showToast({ text: "请选择一个分类" });
      } else if (!utils.judgeNull(this.blogData.content)) {
        utils.showToast({ text: "请输入博客内容" });
      } else {
        this.$axios.post("/admin/blog", this.blogData).then(res => {
          this.$utils.showToast({ text: res.data.data });
          if (res.data.code !== 0) return;
          this.blogData = this.$utils.store.get("defaultData");
          if (this.editOnOff) this.$router.replace("/home/blog/list");
        });
      }
    },
    //添加标签分类
    addTag() {
      if (!this.$utils.judgeNull(this.tagData.tag)) {
        utils.showToast({ text: "请输入标签/分类名" });
      } else {
        this.$axios.post("/admin/tag", this.tagData).then(res => {
          if (res.data.code !== 0) return;
          const status = this.tagData.status;
          this.$utils.showToast({ text: "添加成功" });
          this.tagData.tag = "";
          this.getTag(status, status === 1 ? "blogTag" : "blogType");
        });
      }
    },
    //删除标签分类
    removeTag(id) {
      this.$confirm(`此操作将永久删除该条目, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          return this.$axios.post("/admin/tag", { type: 1, id });
        })
        .then(res => {
          if (res.data.code !== 0) return;
          this.$utils.showToast({ text: "删除成功" });
          const status = this.tagData.status;
          this.getTag(status, status === 1 ? "blogTag" : "blogType");
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.agrms-list .search-wrap {
  margin: 0 0 15px;
}
.tag-list {
  width: 750px;
}
.tag-list li {
  float: left;
  margin-right: 30px;
  cursor: pointer;
}

.tag-list li span:hover {
  color: red;
}

.tag-item {
  margin-right: 15px;
}
</style>
