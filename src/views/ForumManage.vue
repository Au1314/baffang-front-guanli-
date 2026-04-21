<template>
  <div class="forum-manage-container">
    <el-card shadow="never" class="forum-manage-card">
      <template #header>
        <div class="card-header">
          <span>论坛管理</span>
        </div>
      </template>
      
      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" class="forum-tabs" @tab-change="handleTabChange">
        <!-- 帖子管理 -->
        <el-tab-pane label="帖子管理" name="posts">
          <!-- 帖子筛选 -->
          <div class="filter-bar">
            <el-input
              v-model="postFilter.keyword"
              placeholder="请输入帖子标题或内容"
              style="width: 250px; margin-right: 10px"
              clearable
              @keyup.enter="fetchPostList"
            >
              <template #append>
                <el-button @click="fetchPostList"><el-icon><Search /></el-icon></el-button>
              </template>
            </el-input>
            <el-input
              v-model="postFilter.userId"
              placeholder="请输入作者ID"
              style="width: 150px; margin-right: 10px"
              clearable
              @keyup.enter="fetchPostList"
            />
            <el-date-picker
              v-model="postFilter.startTime"
              type="datetime"
              placeholder="开始时间"
              style="width: 200px; margin-right: 10px"
              clearable
            />
            <el-date-picker
              v-model="postFilter.endTime"
              type="datetime"
              placeholder="结束时间"
              style="width: 200px; margin-right: 10px"
              clearable
            />
            <el-select
              v-model="postFilter.isTop"
              placeholder="是否置顶"
              style="width: 120px; margin-right: 10px"
              clearable
            >
              <el-option label="全部" :value="null" />
              <el-option label="置顶" :value="1" />
              <el-option label="非置顶" :value="0" />
            </el-select>
            <el-select
              v-model="postFilter.isEssence"
              placeholder="是否精华"
              style="width: 120px; margin-right: 10px"
              clearable
            >
              <el-option label="全部" :value="null" />
              <el-option label="精华" :value="1" />
              <el-option label="非精华" :value="0" />
            </el-select>
            <el-button @click="resetPostFilter">重置</el-button>
            <el-button 
              type="danger" 
              @click="handleBatchDeletePosts" 
              :disabled="selectedPosts.length === 0"
              style="margin-left: 10px"
            >
              批量删除 ({{ selectedPosts.length }})
            </el-button>
          </div>
          
          <!-- 帖子列表 -->
          <el-table
            :data="postList"
            stripe
            style="width: 100%"
            :loading="postLoading"
            @row-click="handleViewPostDetail"
            @selection-change="handlePostSelectionChange"
            ref="postTable"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" width="300">
              <template #default="scope">
                <div class="post-title">
                  <el-tag v-if="scope.row.isTop" type="danger" size="small">置顶</el-tag>
                  <el-tag v-if="scope.row.isEssence" type="success" size="small">精华</el-tag>
                  {{ scope.row.title }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="coverImage" label="封面图片" width="120">
              <template #default="scope">
                <el-image
                  v-if="scope.row.coverImage"
                  :src="scope.row.coverImage"
                  :preview-src-list="scope.row.images || []"
                  fit="cover"
                  style="width: 80px; height: 60px; border-radius: 4px;"
                >
                  <template #error>
                    <div class="image-error">
                      无图片
                    </div>
                  </template>
                </el-image>
                <span v-else>无图片</span>
              </template>
            </el-table-column>
            <el-table-column prop="userAvatar" label="作者头像" width="80">
              <template #default="scope">
                <el-avatar
                  :src="scope.row.userAvatar || ''"
                  :size="40"
                  style="cursor: pointer;"
                >
                  {{ scope.row.userName?.charAt(0) || '无' }}
                </el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="作者" width="120" />
            <el-table-column prop="userId" label="作者ID" width="100" />
            <el-table-column prop="likeCount" label="点赞数" width="100" />
            <el-table-column prop="replyCount" label="评论数" width="100" />
            <el-table-column prop="collectCount" label="收藏数" width="100" />
            <el-table-column prop="createTime" label="发布时间" width="180" />
            <el-table-column prop="updateTime" label="更新时间" width="180" />
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button
                    size="small"
                    type="primary"
                    @click.stop="handleViewPostDetail(scope.row)"
                    style="margin-right: 8px"
                  >
                    详情
                  </el-button>
                  <el-button
                    size="small"
                    type="warning"
                    @click.stop="handleEditPost(scope.row)"
                    style="margin-right: 8px"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="scope.row.isTop === 0"
                    size="small"
                    @click.stop="handleSetTop(scope.row, 1)"
                    style="margin-right: 8px"
                  >
                    置顶
                  </el-button>
                  <el-button
                    v-else
                    size="small"
                    type="info"
                    @click.stop="handleSetTop(scope.row, 0)"
                    style="margin-right: 8px"
                  >
                    取消置顶
                  </el-button>
                  <el-button
                    v-if="scope.row.isEssence === 0"
                    size="small"
                    @click.stop="handleSetEssence(scope.row, 1)"
                    style="margin-right: 8px"
                  >
                    精华
                  </el-button>
                  <el-button
                    v-else
                    size="small"
                    type="info"
                    @click.stop="handleSetEssence(scope.row, 0)"
                    style="margin-right: 8px"
                  >
                    取消精华
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click.stop="handleDeletePost(scope.row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 帖子分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="postPage"
              v-model:page-size="postPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="postTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePostSizeChange"
              @current-change="handlePostPageChange"
            />
          </div>
        </el-tab-pane>
        
        <!-- 评论管理 -->
        <el-tab-pane label="评论管理" name="comments">
          <!-- 评论筛选 -->
          <div class="filter-bar">
            <el-input
              v-model="commentFilter.keyword"
              placeholder="请输入评论内容"
              style="width: 250px; margin-right: 10px"
              clearable
              @keyup.enter="fetchCommentList"
            >
              <template #append>
                <el-button @click="fetchCommentList"><el-icon><Search /></el-icon></el-button>
              </template>
            </el-input>
            <el-input
              v-model="commentFilter.username"
              placeholder="请输入用户名"
              style="width: 150px; margin-right: 10px"
              clearable
              @keyup.enter="fetchCommentList"
            />
            <el-button @click="resetCommentFilter">重置</el-button>
            <el-button 
              type="danger" 
              @click="handleBatchDeleteComments" 
              :disabled="selectedComments.length === 0"
              style="margin-left: 10px"
            >
              批量删除 ({{ selectedComments.length }})
            </el-button>
          </div>
          
          <!-- 评论列表 -->
          <el-table
            :data="commentList"
            stripe
            style="width: 100%"
            :loading="commentLoading"
            @selection-change="handleCommentSelectionChange"
            ref="commentTable"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="postTitle" label="帖子标题" width="200" show-overflow-tooltip />
            <el-table-column prop="userName" label="评论者" width="120" />
            <el-table-column prop="likeCount" label="点赞数" width="80" align="center" />
            <el-table-column prop="content" label="评论内容" min-width="300">
              <template #default="scope">
                <div class="comment-content">
                  <span v-if="scope.row.parentId" class="reply-prefix">
                    回复 @{{ scope.row.replyToUserName }}：
                  </span>
                  {{ scope.row.content }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="评论时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button
                    size="small"
                    type="primary"
                    @click.stop="handleViewCommentDetail(scope.row)"
                    style="margin-right: 8px"
                  >
                    详情
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click.stop="handleDeleteComment(scope.row)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 评论分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="commentPage"
              v-model:page-size="commentPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="commentTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleCommentSizeChange"
              @current-change="handleCommentPageChange"
            />
          </div>
        </el-tab-pane>
        
        <!-- 举报管理 -->
        <el-tab-pane label="举报管理" name="reports">
          <!-- 举报管理子标签页 -->
          <el-tabs v-model="activeReportTab" @tab-change="handleReportTabChange">
            <!-- 帖子举报 -->
            <el-tab-pane label="帖子举报" name="post-reports">
              <!-- 帖子举报筛选 -->
              <div class="filter-bar">
                <el-input
                  v-model="postReportFilter.keyword"
                  placeholder="请输入举报内容或被举报人"
                  style="width: 250px; margin-right: 10px"
                  clearable
                  @keyup.enter="fetchPostReportList"
                >
                  <template #append>
                    <el-button @click="fetchPostReportList"><el-icon><Search /></el-icon></el-button>
                  </template>
                </el-input>
                <el-select
                  v-model="postReportFilter.status"
                  placeholder="审核状态"
                  style="width: 120px; margin-right: 10px"
                  clearable
                >
                  <el-option label="全部" :value="null" />
                  <el-option label="审核中" :value="1" />
                  <el-option label="已通过" :value="2" />
                  <el-option label="已拒绝" :value="3" />
                </el-select>
                <el-select
                  v-model="postReportFilter.priority"
                  placeholder="优先级"
                  style="width: 120px; margin-right: 10px"
                  clearable
                >
                  <el-option label="全部" :value="null" />
                  <el-option label="普通" :value="1" />
                  <el-option label="高" :value="2" />
                  <el-option label="紧急" :value="3" />
                </el-select>
                <el-date-picker
                  v-model="postReportFilter.startTime"
                  type="datetime"
                  placeholder="开始时间"
                  style="width: 200px; margin-right: 10px"
                  clearable
                />
                <el-date-picker
                  v-model="postReportFilter.endTime"
                  type="datetime"
                  placeholder="结束时间"
                  style="width: 200px; margin-right: 10px"
                  clearable
                />
                <el-button @click="resetPostReportFilter">重置</el-button>
              </div>
              
              <!-- 帖子举报列表 -->
              <el-table
                :data="postReportList"
                stripe
                style="width: 100%"
                :loading="postReportLoading"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="auditNo" label="审核单号" width="180" />
                <el-table-column prop="title" label="举报标题" width="250" show-overflow-tooltip />
                <el-table-column prop="applicantName" label="举报人" width="120" />
                <el-table-column prop="reportedUserName" label="被举报人" width="120" />
                <el-table-column prop="priorityName" label="优先级" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.priority === 3 ? 'danger' : scope.row.priority === 2 ? 'warning' : 'info'">
                      {{ scope.row.priorityName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="statusName" label="审核状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.currentStatus === 1 ? 'warning' : scope.row.currentStatus === 2 ? 'success' : 'danger'">
                      {{ scope.row.statusName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="submitTime" label="提交时间" width="180" />
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <div class="operation-buttons">
                      <el-button
                        size="small"
                        type="primary"
                        @click.stop="handleViewReportDetail(scope.row)"
                        style="margin-right: 8px"
                      >
                        详情
                      </el-button>
                      <el-button
                        v-if="scope.row.currentStatus === 1"
                        size="small"
                        type="success"
                        @click.stop="handleAuditReport(scope.row, 2)"
                        style="margin-right: 8px"
                      >
                        通过
                      </el-button>
                      <el-button
                        v-if="scope.row.currentStatus === 1"
                        size="small"
                        type="danger"
                        @click.stop="handleAuditReport(scope.row, 3)"
                      >
                        拒绝
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 帖子举报分页 -->
              <div class="pagination">
                <el-pagination
                  v-model:current-page="postReportPage"
                  v-model:page-size="postReportPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="postReportTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handlePostReportSizeChange"
                  @current-change="handlePostReportPageChange"
                />
              </div>
            </el-tab-pane>
            
            <!-- 评论举报 -->
            <el-tab-pane label="评论举报" name="comment-reports">
              <!-- 评论举报筛选 -->
              <div class="filter-bar">
                <el-input
                  v-model="commentReportFilter.keyword"
                  placeholder="请输入举报内容或被举报人"
                  style="width: 250px; margin-right: 10px"
                  clearable
                  @keyup.enter="fetchCommentReportList"
                >
                  <template #append>
                    <el-button @click="fetchCommentReportList"><el-icon><Search /></el-icon></el-button>
                  </template>
                </el-input>
                <el-select
                  v-model="commentReportFilter.status"
                  placeholder="审核状态"
                  style="width: 120px; margin-right: 10px"
                  clearable
                >
                  <el-option label="全部" :value="null" />
                  <el-option label="审核中" :value="1" />
                  <el-option label="已通过" :value="2" />
                  <el-option label="已拒绝" :value="3" />
                </el-select>
                <el-select
                  v-model="commentReportFilter.priority"
                  placeholder="优先级"
                  style="width: 120px; margin-right: 10px"
                  clearable
                >
                  <el-option label="全部" :value="null" />
                  <el-option label="普通" :value="1" />
                  <el-option label="高" :value="2" />
                  <el-option label="紧急" :value="3" />
                </el-select>
                <el-date-picker
                  v-model="commentReportFilter.startTime"
                  type="datetime"
                  placeholder="开始时间"
                  style="width: 200px; margin-right: 10px"
                  clearable
                />
                <el-date-picker
                  v-model="commentReportFilter.endTime"
                  type="datetime"
                  placeholder="结束时间"
                  style="width: 200px; margin-right: 10px"
                  clearable
                />
                <el-button @click="resetCommentReportFilter">重置</el-button>
              </div>
              
              <!-- 评论举报列表 -->
              <el-table
                :data="commentReportList"
                stripe
                style="width: 100%"
                :loading="commentReportLoading"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="auditNo" label="审核单号" width="180" />
                <el-table-column prop="title" label="举报标题" width="250" show-overflow-tooltip />
                <el-table-column prop="applicantName" label="举报人" width="120" />
                <el-table-column prop="reportedUserName" label="被举报人" width="120" />
                <el-table-column prop="priorityName" label="优先级" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.priority === 3 ? 'danger' : scope.row.priority === 2 ? 'warning' : 'info'">
                      {{ scope.row.priorityName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="statusName" label="审核状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.currentStatus === 1 ? 'warning' : scope.row.currentStatus === 2 ? 'success' : 'danger'">
                      {{ scope.row.statusName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="submitTime" label="提交时间" width="180" />
                <el-table-column label="操作" width="200" fixed="right">
                  <template #default="scope">
                    <div class="operation-buttons">
                      <el-button
                        size="small"
                        type="primary"
                        @click.stop="handleViewReportDetail(scope.row)"
                        style="margin-right: 8px"
                      >
                        详情
                      </el-button>
                      <el-button
                        v-if="scope.row.currentStatus === 1"
                        size="small"
                        type="success"
                        @click.stop="handleAuditReport(scope.row, 2)"
                        style="margin-right: 8px"
                      >
                        通过
                      </el-button>
                      <el-button
                        v-if="scope.row.currentStatus === 1"
                        size="small"
                        type="danger"
                        @click.stop="handleAuditReport(scope.row, 3)"
                      >
                        拒绝
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 评论举报分页 -->
              <div class="pagination">
                <el-pagination
                  v-model:current-page="commentReportPage"
                  v-model:page-size="commentReportPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="commentReportTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleCommentReportSizeChange"
                  @current-change="handleCommentReportPageChange"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 帖子详情弹窗 -->
    <el-dialog
      v-model="showPostDetail"
      title="帖子详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="postDetailLoading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else-if="currentPost" class="post-detail">
        <h3 class="post-detail-title">
          <el-tag v-if="currentPost.isTop" type="danger" size="small">置顶</el-tag>
          <el-tag v-if="currentPost.isEssence" type="success" size="small">精华</el-tag>
          {{ currentPost.title }}
        </h3>
        <div class="post-meta">
          <el-avatar
            :src="currentPost.userAvatar || ''"
            :size="40"
            style="margin-right: 10px; vertical-align: middle;"
          >
            {{ currentPost.userName?.charAt(0) || '无' }}
          </el-avatar>
          <span>作者：{{ currentPost.userName }}</span>
          <span>昵称：{{ currentPost.userNickname }}</span>
          <span>作者ID：{{ currentPost.userId }}</span>
          <span>电话：{{ currentPost.userPhone }}</span>
          <span>发布时间：{{ currentPost.createTime }}</span>
          <span>更新时间：{{ currentPost.updateTime }}</span>
          <span>点赞数：{{ currentPost.likeCount }}</span>
          <span>评论数：{{ currentPost.replyCount }}</span>
          <span>收藏数：{{ currentPost.collectCount }}</span>
        </div>
        <!-- 封面图片 -->
        <div class="post-cover-image" v-if="currentPost.coverImage">
          <h4>封面图片</h4>
          <el-image
            :src="currentPost.coverImage"
            :preview-src-list="currentPost.images || [currentPost.coverImage]"
            fit="cover"
            style="width: 100%; max-height: 400px; border-radius: 8px;"
          >
            <template #error>
              <div class="image-error">
                封面图片加载失败
              </div>
            </template>
          </el-image>
        </div>
        <div class="post-content">
          {{ currentPost.content }}
        </div>
        <!-- 帖子内容图片列表 -->
        <div class="post-images" v-if="currentPost.images && currentPost.images.length > 0">
          <h4>内容图片</h4>
          <div class="image-list">
            <el-image
              v-for="(image, index) in currentPost.images"
              :key="index"
              :src="image"
              :preview-src-list="currentPost.images"
              fit="cover"
              style="width: 150px; height: 120px; margin: 10px; border-radius: 8px;"
            >
              <template #error>
                <div class="image-error">
                  图片加载失败
                </div>
              </template>
            </el-image>
          </div>
        </div>
        
        <!-- 最新回复列表 -->
        <div v-if="currentPost.latestReplies && currentPost.latestReplies.length > 0" class="latest-replies">
          <h4>最新回复</h4>
          <el-divider />
          <div class="reply-item" v-for="reply in currentPost.latestReplies" :key="reply.id">
            <div class="reply-header">
              <el-avatar
                :src="reply.userAvatar || ''"
                :size="32"
                style="margin-right: 8px; vertical-align: middle;"
              >
                {{ reply.userName?.charAt(0) || '无' }}
              </el-avatar>
              <span class="reply-user">{{ reply.userName }}</span>
              <span class="reply-time">{{ reply.createTime }}</span>
              <span class="reply-like">
                <el-icon><Star /></el-icon> {{ reply.likeCount }}
              </span>
            </div>
            <div class="reply-content">
              <span v-if="reply.replyToUserId" class="reply-to">
                回复 @{{ reply.replyToUserName }}：
              </span>
              {{ reply.content }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPostDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 帖子编辑弹窗 -->
    <el-dialog
      v-model="showEditPost"
      title="编辑帖子"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="editPostForm" label-width="80px">
        <el-form-item label="帖子标题" required>
          <el-input v-model="editPostForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="帖子内容" required>
          <el-input
            v-model="editPostForm.content"
            type="textarea"
            rows="8"
            placeholder="请输入帖子内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditPost = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitEdit" :loading="editLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 举报详情弹窗 -->
    <el-dialog
      v-model="showReportDetail"
      title="举报详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="detailLoading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else class="report-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="审核单号">{{ currentReport.auditNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="举报标题">{{ currentReport.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核类型">{{ currentReport.auditTypeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="业务ID">{{ currentReport.businessId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="举报人">
            {{ currentReport.applicantName || '-' }}
            <div v-if="currentReport.applicantUsername" style="font-size: 12px; color: #606266; margin-top: 4px;">
              用户名：{{ currentReport.applicantUsername }}
            </div>
            <div v-if="currentReport.applicantPhone" style="font-size: 12px; color: #606266;">
              电话：{{ currentReport.applicantPhone }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="被举报人">
            <div>
              {{ currentReport.reportedUserName || '-' }}
              <span v-if="currentReport.reportedUserId" style="font-size: 12px; color: #606266; margin-left: 10px;">
                ID：{{ currentReport.reportedUserId }}
              </span>
            </div>
            <div v-if="currentReport.reportedUserAvatar" style="margin-top: 4px;">
              <el-avatar :src="currentReport.reportedUserAvatar" size="small"></el-avatar>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="currentReport.priority === 3 ? 'danger' : currentReport.priority === 2 ? 'warning' : 'info'">
              {{ currentReport.priorityName || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentReport.currentStatus === 1 ? 'warning' : currentReport.currentStatus === 2 ? 'success' : 'danger'">
              {{ currentReport.statusName || '-' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentReport.submitTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ currentReport.finishTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="举报内容" :span="2">{{ currentReport.content || '-' }}</el-descriptions-item>
          <el-descriptions-item label="被举报内容" :span="2">{{ currentReport.reportedContent || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最终意见" :span="2">{{ currentReport.finalOpinion || '-' }}</el-descriptions-item>
          <el-descriptions-item label="拒绝原因" :span="2">{{ currentReport.rejectReason || '-' }}</el-descriptions-item>
          <!-- 附件列表 -->
          <el-descriptions-item label="附件列表" :span="2">
            <div class="attachment-list" v-if="formattedAttachments.length > 0">
              <el-link
                v-for="(attachment, index) in formattedAttachments"
                :key="index"
                :href="attachment"
                target="_blank"
                style="margin-right: 10px; margin-bottom: 10px; display: inline-block"
              >
                {{ attachment.split('/').pop() }}
              </el-link>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
          <!-- 审核日志 -->
          <el-descriptions-item label="审核日志" :span="2">
            <div class="audit-logs" v-if="currentReport.auditLogs && currentReport.auditLogs.length > 0">
              <el-timeline>
                <el-timeline-item
                  v-for="(log, index) in currentReport.auditLogs"
                  :key="index"
                  :timestamp="log.createTime || '-'"
                  :type="log.action === 1 ? 'success' : 'warning'"
                >
                  <div class="log-content">
                    <div><strong>{{ log.actionName || '-' }}</strong></div>
                    <div>操作人：{{ log.adminName || '-' }}</div>
                    <div>状态变更：{{ log.fromStatusName || '-' }} → {{ log.toStatusName || '-' }}</div>
                    <div v-if="log.opinion">审核意见：{{ log.opinion }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReportDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 审核对话框 -->
    <el-dialog
      v-model="showAuditDialog"
      title="举报审核"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="auditForm" label-position="top">
        <el-form-item label="审核意见" required>
          <el-input
            v-model="auditForm.opinion"
            type="textarea"
            rows="4"
            placeholder="请输入审核意见"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="是否删除内容" v-if="auditAction === 2">
          <el-switch
            v-model="auditForm.deleteContent"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleApproveReport">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 评论详情弹窗 -->
    <el-dialog
      v-model="showCommentDetail"
      title="评论详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="commentDetailLoading" class="loading-container">
        <el-skeleton :rows="15" animated />
      </div>
      <div v-else class="comment-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="评论ID">{{ commentDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="帖子ID">{{ commentDetail.postId }}</el-descriptions-item>
          <el-descriptions-item label="帖子标题">{{ commentDetail.postTitle }}</el-descriptions-item>
          <el-descriptions-item label="评论内容" :span="2">{{ commentDetail.content }}</el-descriptions-item>
          <el-descriptions-item label="用户信息">
            <div class="user-info">
              <span>用户名：{{ commentDetail.userName }}</span>
              <span>用户ID：{{ commentDetail.userId }}</span>
              <span>用户电话：{{ commentDetail.userPhone }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ commentDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ commentDetail.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ commentDetail.likeCount }}</el-descriptions-item>
          <el-descriptions-item label="父评论内容" v-if="commentDetail.parentContent">
            <div class="parent-comment">
              {{ commentDetail.parentContent }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="回复目标" v-if="commentDetail.replyToUserId">
            回复 @{{ commentDetail.replyToUserName }} (ID: {{ commentDetail.replyToUserId }})
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 子回复列表 -->
        <div v-if="commentDetail.childReplies && commentDetail.childReplies.length > 0" class="child-replies">
          <h4 style="margin: 20px 0 10px 0;">子回复 ({{ commentDetail.childReplies.length }})</h4>
          <el-divider />
          <el-table :data="commentDetail.childReplies" border stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="userName" label="评论者" width="120" />
            <el-table-column prop="content" label="回复内容" min-width="300">
              <template #default="scope">
                <div class="reply-content">
                  <span v-if="scope.row.parentId" class="reply-prefix">
                    回复 @{{ scope.row.replyToUserName }}：
                  </span>
                  {{ scope.row.content }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="likeCount" label="点赞数" width="100" align="center" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCommentDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'
import {
  Search,
  Edit,
  Delete,
  Top,
  Star,
  Check,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()
const adminStore = useAdminStore()

// 当前激活的标签页
const activeTab = ref('posts')

// 帖子管理
const postList = ref([])
const postTotal = ref(0)
const postPage = ref(1)
const postPageSize = ref(20)
const postLoading = ref(false)
const postTable = ref(null)
const selectedPosts = ref([])

const postFilter = reactive({
  keyword: '',
  userId: null,
  isTop: null,
  isEssence: null,
  startTime: null,
  endTime: null
})

// 帖子详情
const showPostDetail = ref(false)
const currentPost = ref(null)
const postDetailLoading = ref(false)

// 帖子编辑
const showEditPost = ref(false)
const editLoading = ref(false)
const editPostForm = reactive({
  id: '',
  title: '',
  content: ''
})

// 评论管理
const commentList = ref([])
const commentTotal = ref(0)
const commentPage = ref(1)
const commentPageSize = ref(20)
const commentLoading = ref(false)
const commentTable = ref(null)
const selectedComments = ref([])

const commentFilter = reactive({
  keyword: '',
  username: ''
})

// 评论详情
const showCommentDetail = ref(false)
const commentDetail = ref({})
const commentDetailLoading = ref(false)

// 举报管理
// 当前激活的举报子标签页
const activeReportTab = ref('post-reports')

// 帖子举报管理
const postReportList = ref([])
const postReportTotal = ref(0)
const postReportPage = ref(1)
const postReportPageSize = ref(20)
const postReportLoading = ref(false)

const postReportFilter = reactive({
  keyword: '',
  status: null,
  reportType: null,
  priority: null,
  startTime: null,
  endTime: null
})

// 评论举报管理
const commentReportList = ref([])
const commentReportTotal = ref(0)
const commentReportPage = ref(1)
const commentReportPageSize = ref(20)
const commentReportLoading = ref(false)

const commentReportFilter = reactive({
  keyword: '',
  status: null,
  priority: null,
  startTime: null,
  endTime: null
})

// 举报详情
const showReportDetail = ref(false)
const currentReport = ref({})
const detailLoading = ref(false)

// 格式化附件列表
const formattedAttachments = computed(() => {
  if (!currentReport.value) return []
  
  let attachments = []
  
  // 优先使用attachmentList数组
  if (Array.isArray(currentReport.value.attachmentList) && currentReport.value.attachmentList.length > 0) {
    attachments = currentReport.value.attachmentList
  } 
  // 如果attachmentList不存在或为空，尝试从attachments字符串解析
  else if (typeof currentReport.value.attachments === 'string' && currentReport.value.attachments.trim()) {
    attachments = currentReport.value.attachments.split(',')
  }
  
  // 清理和过滤附件
  return attachments.map(attach => {
    if (typeof attach === 'string') {
      // 清理可能存在的空格和引号
      const cleaned = attach.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '')
      return cleaned
    }
    return ''
  }).filter(attach => attach)
})

// 审核相关
const showAuditDialog = ref(false)
const currentAuditReport = ref({})
const auditAction = ref(0)
const auditForm = reactive({
  opinion: '',
  deleteContent: false
})

// 举报类型映射
const reportTypeMap = {
  1: '内容违规',
  2: '广告垃圾',
  3: '人身攻击',
  4: '其他'
}

// 获取举报类型名称
const getReportTypeName = (type) => {
  return reportTypeMap[type] || '未知类型'
}

// 处理帖子选择变化
const handlePostSelectionChange = (selection) => {
  selectedPosts.value = selection
}

// 获取帖子列表
const fetchPostList = async () => {
  try {
    postLoading.value = true
    const params = {
      pageNum: postPage.value,
      pageSize: postPageSize.value,
      keyword: postFilter.keyword,
      userId: postFilter.userId,
      isTop: postFilter.isTop,
      isEssence: postFilter.isEssence,
      startTime: postFilter.startTime,
      endTime: postFilter.endTime
    }
    console.log('请求帖子列表参数:', params)
    const response = await authApi.getPostList(params)
    console.log('帖子列表响应:', response)
    postList.value = response?.list || []
    postTotal.value = response?.total || 0
    // 清空选中状态
    selectedPosts.value = []
    if (postTable.value) {
      postTable.value.clearSelection()
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    if (error.response) {
      ElMessage.error(`获取帖子列表失败：${error.response.data?.msg || '服务器错误'}`)
    } else {
      ElMessage.error(`获取帖子列表失败：${error.message}`)
    }
  } finally {
    postLoading.value = false
  }
}

// 重置帖子筛选
const resetPostFilter = () => {
  postFilter.keyword = ''
  postFilter.userId = null
  postFilter.isTop = null
  postFilter.isEssence = null
  postFilter.startTime = null
  postFilter.endTime = null
  postPage.value = 1
  fetchPostList()
}

// 帖子分页大小变化
const handlePostSizeChange = (size) => {
  postPageSize.value = size
  postPage.value = 1
  fetchPostList()
}

// 帖子页码变化
const handlePostPageChange = (page) => {
  postPage.value = page
  fetchPostList()
}

// 查看帖子详情
const handleViewPostDetail = async (post) => {
  try {
    postDetailLoading.value = true
    const response = await authApi.getPostDetail(post.id)
    currentPost.value = response
    showPostDetail.value = true
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  } finally {
    postDetailLoading.value = false
  }
}

// 编辑帖子
const handleEditPost = (post) => {
  editPostForm.id = post.id
  editPostForm.title = post.title
  editPostForm.content = post.content
  showEditPost.value = true
}

// 提交编辑
const handleSubmitEdit = async () => {
  if (!editPostForm.title || !editPostForm.content) {
    ElMessage.warning('请填写完整的帖子信息')
    return
  }
  
  try {
    editLoading.value = true
    const response = await authApi.editPost(editPostForm.id, {
      title: editPostForm.title,
      content: editPostForm.content
    })
    ElMessage.success('帖子编辑成功')
    showEditPost.value = false
    fetchPostList()
  } catch (error) {
    console.error('编辑帖子失败:', error)
    ElMessage.error('编辑帖子失败')
  } finally {
    editLoading.value = false
  }
}

// 设置置顶
const handleSetTop = async (post, isTop) => {
  try {
    await authApi.setPostTop(post.id, { isTop })
    ElMessage.success(`帖子${isTop ? '置顶' : '取消置顶'}成功`)
    fetchPostList()
  } catch (error) {
    console.error(`设置置顶失败:`, error)
    ElMessage.error(`帖子${isTop ? '置顶' : '取消置顶'}失败`)
  }
}

// 设置精华
const handleSetEssence = async (post, isEssence) => {
  try {
    await authApi.setPostEssence(post.id, { isEssence })
    ElMessage.success(`帖子${isEssence ? '设为精华' : '取消精华'}成功`)
    fetchPostList()
  } catch (error) {
    console.error(`设置精华失败:`, error)
    ElMessage.error(`帖子${isEssence ? '设为精华' : '取消精华'}失败`)
  }
}

// 删除帖子
const handleDeletePost = async (post) => {
  try {
    await ElMessageBox.confirm('确定要删除该帖子吗？删除后不可恢复！', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    
    // 记录删除操作日志
    console.log(`[论坛管理] 删除帖子：ID=${post.id}，标题=${post.title}`)
    
    await authApi.deletePost(post.id)
    ElMessage.success('帖子删除成功')
    fetchPostList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[论坛管理] 删除帖子失败:', error)
      if (error.response) {
        // 服务器返回了错误信息
        ElMessage.error(`帖子删除失败：${error.response.data?.msg || '服务器错误'}`)
      } else if (error.request) {
        // 请求已发送但没有收到响应
        ElMessage.error('帖子删除失败：网络错误，服务器无响应')
      } else {
        // 请求配置错误
        ElMessage.error(`帖子删除失败：${error.message}`)
      }
    }
  }
}

// 批量删除帖子
const handleBatchDeletePosts = async () => {
  if (selectedPosts.value.length === 0) {
    ElMessage.warning('请先选择要删除的帖子')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedPosts.value.length}个帖子吗？删除后不可恢复！`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    
    // 记录删除操作日志
    console.log(`[论坛管理] 批量删除帖子：ID=${selectedPosts.value.map(post => post.id).join(', ')}`)
    
    const postIds = selectedPosts.value.map(post => post.id)
    await authApi.batchDeletePost(postIds)
    ElMessage.success(`成功删除${selectedPosts.value.length}个帖子`)
    fetchPostList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[论坛管理] 批量删除帖子失败:', error)
      if (error.response) {
        // 服务器返回了错误信息
        ElMessage.error(`批量删除帖子失败：${error.response.data?.msg || '服务器错误'}`)
      } else if (error.request) {
        // 请求已发送但没有收到响应
        ElMessage.error('批量删除帖子失败：网络错误，服务器无响应')
      } else {
        // 请求配置错误
        ElMessage.error(`批量删除帖子失败：${error.message}`)
      }
    }
  }
}

// 处理评论选择变化
const handleCommentSelectionChange = (selection) => {
  selectedComments.value = selection
}

// 获取评论列表
const fetchCommentList = async () => {
  try {
    commentLoading.value = true
    const params = {
      page: commentPage.value,
      size: commentPageSize.value,
      username: commentFilter.username,
      keyword: commentFilter.keyword
    }
    console.log('请求评论列表参数:', params)
    const response = await authApi.getCommentList(params)
    console.log('评论列表响应:', response)
    commentList.value = response?.list || []
    commentTotal.value = response?.total || 0
    console.log('评论列表数据:', commentList.value)
    console.log('评论总数:', commentTotal.value)
    // 清空选中状态
    selectedComments.value = []
    if (commentTable.value) {
      commentTable.value.clearSelection()
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    if (error.response) {
      ElMessage.error(`获取评论列表失败：${error.response.data?.msg || '服务器错误'}`)
    } else {
      ElMessage.error(`获取评论列表失败：${error.message}`)
    }
  } finally {
    commentLoading.value = false
  }
}

// 重置评论筛选
const resetCommentFilter = () => {
  commentFilter.keyword = ''
  commentFilter.username = ''
  commentPage.value = 1
  fetchCommentList()
}

// 评论分页大小变化
const handleCommentSizeChange = (size) => {
  commentPageSize.value = size
  commentPage.value = 1
  fetchCommentList()
}

// 评论页码变化
const handleCommentPageChange = (page) => {
  commentPage.value = page
  fetchCommentList()
}

// 删除评论
const handleDeleteComment = async (comment) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await authApi.deleteComment(comment.id)
    ElMessage.success('评论删除成功')
    fetchCommentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('评论删除失败')
    }
  }
}

// 查看评论详情
const handleViewCommentDetail = async (comment) => {
  try {
    commentDetailLoading.value = true
    showCommentDetail.value = true
    await fetchCommentDetail(comment.id)
  } catch (error) {
    console.error('获取评论详情失败:', error)
    ElMessage.error('获取评论详情失败')
  } finally {
    commentDetailLoading.value = false
  }
}

// 获取评论详情
const fetchCommentDetail = async (commentId) => {
  try {
    commentDetailLoading.value = true
    const response = await authApi.getCommentDetail(commentId)
    commentDetail.value = response || {}
  } catch (error) {
    console.error('获取评论详情失败:', error)
    ElMessage.error('获取评论详情失败')
  } finally {
    commentDetailLoading.value = false
  }
}

// 批量删除评论
const handleBatchDeleteComments = async () => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请先选择要删除的评论')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedComments.value.length}条评论吗？删除后不可恢复！`, '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    
    // 记录删除操作日志
    console.log(`[论坛管理] 批量删除评论：ID=${selectedComments.value.map(comment => comment.id).join(', ')}`)
    
    const commentIds = selectedComments.value.map(comment => comment.id)
    await authApi.batchDeleteComment(commentIds)
    ElMessage.success(`成功删除${selectedComments.value.length}条评论`)
    fetchCommentList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[论坛管理] 批量删除评论失败:', error)
      if (error.response) {
        // 服务器返回了错误信息
        ElMessage.error(`批量删除评论失败：${error.response.data?.msg || '服务器错误'}`)
      } else if (error.request) {
        // 请求已发送但没有收到响应
        ElMessage.error('批量删除评论失败：网络错误，服务器无响应')
      } else {
        // 请求配置错误
        ElMessage.error(`批量删除评论失败：${error.message}`)
      }
    }
  }
}

// 获取帖子举报列表
const fetchPostReportList = async () => {
  try {
    postReportLoading.value = true
    const params = {
      pageNum: postReportPage.value,
      pageSize: postReportPageSize.value,
      keyword: postReportFilter.keyword,
      status: postReportFilter.status,
      reportType: postReportFilter.reportType,
      priority: postReportFilter.priority,
      startTime: postReportFilter.startTime,
      endTime: postReportFilter.endTime
    }
    console.log('请求帖子举报列表参数:', params)
    const response = await authApi.getPostReportList(params)
    console.log('帖子举报列表响应:', response)
    postReportList.value = response?.list || []
    postReportTotal.value = response?.total || 0
  } catch (error) {
    console.error('获取帖子举报列表失败:', error)
    if (error.response) {
      ElMessage.error(`获取帖子举报列表失败：${error.response.data?.msg || '服务器错误'}`)
    } else {
      ElMessage.error(`获取帖子举报列表失败：${error.message}`)
    }
  } finally {
    postReportLoading.value = false
  }
}

// 获取评论举报列表
const fetchCommentReportList = async () => {
  try {
    commentReportLoading.value = true
    const params = {
      pageNum: commentReportPage.value,
      pageSize: commentReportPageSize.value,
      keyword: commentReportFilter.keyword,
      status: commentReportFilter.status,
      priority: commentReportFilter.priority,
      startTime: commentReportFilter.startTime,
      endTime: commentReportFilter.endTime
    }
    console.log('请求评论举报列表参数:', params)
    const response = await authApi.getCommentReportList(params)
    console.log('评论举报列表响应:', response)
    commentReportList.value = response?.list || []
    commentReportTotal.value = response?.total || 0
  } catch (error) {
    console.error('获取评论举报列表失败:', error)
    if (error.response) {
      ElMessage.error(`获取评论举报列表失败：${error.response.data?.msg || '服务器错误'}`)
    } else {
      ElMessage.error(`获取评论举报列表失败：${error.message}`)
    }
  } finally {
    commentReportLoading.value = false
  }
}

// 重置帖子举报筛选
const resetPostReportFilter = () => {
  postReportFilter.keyword = ''
  postReportFilter.status = null
  postReportFilter.reportType = null
  postReportFilter.priority = null
  postReportFilter.startTime = null
  postReportFilter.endTime = null
  postReportPage.value = 1
  fetchPostReportList()
}

// 重置评论举报筛选
const resetCommentReportFilter = () => {
  commentReportFilter.keyword = ''
  commentReportFilter.status = null
  commentReportFilter.priority = null
  commentReportFilter.startTime = null
  commentReportFilter.endTime = null
  commentReportPage.value = 1
  fetchCommentReportList()
}

// 帖子举报分页大小变化
const handlePostReportSizeChange = (size) => {
  postReportPageSize.value = size
  postReportPage.value = 1
  fetchPostReportList()
}

// 帖子举报页码变化
const handlePostReportPageChange = (page) => {
  postReportPage.value = page
  fetchPostReportList()
}

// 评论举报分页大小变化
const handleCommentReportSizeChange = (size) => {
  commentReportPageSize.value = size
  commentReportPage.value = 1
  fetchCommentReportList()
}

// 评论举报页码变化
const handleCommentReportPageChange = (page) => {
  commentReportPage.value = page
  fetchCommentReportList()
}

// 举报子标签页切换
const handleReportTabChange = (tabName) => {
  if (tabName === 'post-reports') {
    fetchPostReportList()
  } else if (tabName === 'comment-reports') {
    fetchCommentReportList()
  }
}

// 查看举报详情
const handleViewReportDetail = async (report) => {
  try {
    showReportDetail.value = true
    detailLoading.value = true
    const response = await authApi.getReportDetail(report.id)
    currentReport.value = response || {}
  } catch (error) {
    console.error('获取举报详情失败:', error)
    ElMessage.error('获取举报详情失败')
    currentReport.value = {}
  } finally {
    detailLoading.value = false
  }
}

// 审核举报
const handleAuditReport = async (report, status) => {
  if (status === 2) {
    // 审核通过，打开审核对话框
    currentAuditReport.value = report
    auditAction.value = status
    auditForm.opinion = ''
    auditForm.deleteContent = false
    showAuditDialog.value = true
  } else {
    // 审核拒绝，调用rejectReport API
    try {
      await ElMessageBox.prompt('请输入审核意见', '审核意见', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入审核意见',
        inputValidator: (value) => {
          if (!value.trim()) {
            return '请输入审核意见'
          }
        }
      }).then(async ({ value: opinion }) => {
        await authApi.rejectReport(report.id, {
          opinion,
          rejectReason: opinion // 使用相同的意见作为拒绝原因
        })
        ElMessage.success(`举报${status === 2 ? '审核通过' : '审核拒绝'}成功`)
        // 根据当前激活的标签页刷新对应的数据
        if (activeReportTab.value === 'post-reports') {
          fetchPostReportList()
        } else if (activeReportTab.value === 'comment-reports') {
          fetchCommentReportList()
        }
      })
    } catch (error) {
      if (error !== 'cancel') {
        console.error('审核举报失败:', error)
        ElMessage.error(`举报${status === 2 ? '审核通过' : '审核拒绝'}失败`)
      }
    }
  }
}

// 处理审核通过
const handleApproveReport = async () => {
  if (!auditForm.opinion.trim()) {
    ElMessage.warning('请输入审核意见')
    return
  }
  try {
    await authApi.approveReport(currentAuditReport.value.id, {
      opinion: auditForm.opinion,
      deleteContent: auditForm.deleteContent
    })
    ElMessage.success('举报审核通过成功')
    showAuditDialog.value = false
    // 根据当前激活的标签页刷新对应的数据
    if (activeReportTab.value === 'post-reports') {
      fetchPostReportList()
    } else if (activeReportTab.value === 'comment-reports') {
      fetchCommentReportList()
    }
  } catch (error) {
    console.error('审核举报失败:', error)
    ElMessage.error('举报审核通过失败')
  }
}

// 标签页切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'posts') {
    fetchPostList()
  } else if (tabName === 'comments') {
    fetchCommentList()
  } else if (tabName === 'reports') {
    // 根据当前激活的子标签页加载对应的数据
    if (activeReportTab.value === 'post-reports') {
      fetchPostReportList()
    } else if (activeReportTab.value === 'comment-reports') {
      fetchCommentReportList()
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  if (activeTab.value === 'posts') {
    fetchPostList()
  } else if (activeTab.value === 'comments') {
    fetchCommentList()
  } else if (activeTab.value === 'reports') {
    // 根据当前激活的子标签页加载对应的数据
    if (activeReportTab.value === 'post-reports') {
      fetchPostReportList()
    } else if (activeReportTab.value === 'comment-reports') {
      fetchCommentReportList()
    }
  }
})
</script>

<style scoped>
.forum-manage-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.forum-manage-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.forum-tabs {
  margin-top: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-title {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.post-detail {
  padding: 10px;
}

.loading-container {
  padding: 20px;
}

.post-detail-title {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
  flex-wrap: wrap;
}

.post-content {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.latest-replies {
  margin-top: 20px;
}

.latest-replies h4 {
  margin-bottom: 10px;
  color: #303133;
}

.reply-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
  flex-wrap: wrap;
}

.reply-user {
  font-weight: bold;
  color: #303133;
}

.reply-content {
  line-height: 1.5;
  color: #303133;
  font-size: 14px;
}

.reply-to {
  color: #409eff;
  margin-right: 5px;
}

.comment-content {
  line-height: 1.6;
}

.reply-prefix {
  color: #409eff;
  font-weight: bold;
  margin-right: 5px;
}

.report-detail {
  padding: 10px;
}

/* 附件列表样式 */
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 审核日志样式 */
.audit-logs {
  margin-top: 10px;
}

.log-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>