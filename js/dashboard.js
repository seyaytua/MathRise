export class Dashboard {
  constructor(progressManager) {
    this.progress = progressManager;
    this.currentCourseId = null;
  }

  /**
   * ダッシュボードを表示
   */
  render(courseId, courseName) {
    this.currentCourseId = courseId;
    const stats = this.progress.getStatistics(courseId);

    if (!stats) {
      this.showEmptyState();
      return;
    }

    // 概要カードを更新
    this.renderOverview(stats);

    // 進捗グラフを描画
    this.renderProgressChart(courseId);

    // バッジを表示
    this.renderBadges(stats);

    // レッスン詳細を表示
    this.renderLessonDetails(courseId);

    // データ情報を表示
    this.renderDataInfo(stats);
  }

  /**
   * 概要カードの更新
   */
  renderOverview(stats) {
    document.getElementById('stat-completed').textContent = stats.completedLessons;
    document.getElementById('stat-total').textContent = stats.totalLessons;
    document.getElementById('stat-accuracy').textContent = `${stats.accuracy}%`;
    document.getElementById('stat-attempts').textContent = stats.totalAttempts;
    document.getElementById('stat-progress').textContent = `${stats.progressPercentage}%`;
  }

  /**
   * 進捗グラフの描画
   */
  renderProgressChart(courseId) {
    const chartContainer = document.querySelector('.progress-chart');
    if (!chartContainer) return;

    const course = this.progress.data.courses[courseId];
    if (!course) return;

    // レッスンごとの正答率を取得
    const lessonStats = [];
    const lessonIds = Object.keys(course.lessonProgress);

    lessonIds.forEach((lessonId, index) => {
      const accuracy = this.progress.getLessonAccuracy(courseId, lessonId);
      lessonStats.push({
        lessonId,
        lessonNumber: index + 1,
        accuracy: accuracy || 0
      });
    });

    // グラフを描画
    chartContainer.innerHTML = '';
    
    lessonStats.forEach(stat => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${stat.accuracy}%`;
      bar.title = `レッスン${stat.lessonNumber}: ${stat.accuracy}%`;

      const label = document.createElement('div');
      label.className = 'chart-bar-label';
      label.textContent = `L${stat.lessonNumber}`;

      const value = document.createElement('div');
      value.className = 'chart-bar-value';
      value.textContent = `${stat.accuracy}%`;

      bar.appendChild(label);
      bar.appendChild(value);
      chartContainer.appendChild(bar);
    });
  }

  /**
   * バッジの表示
   */
  renderBadges(stats) {
    const container = document.getElementById('badges-container');
    if (!container) return;

    const badges = this.getBadges(stats);
    
    container.innerHTML = '';
    badges.forEach(badge => {
      const badgeElement = document.createElement('div');
      badgeElement.className = `badge ${badge.earned ? 'earned' : 'locked'}`;

      badgeElement.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-description">${badge.description}</div>
      `;

      container.appendChild(badgeElement);
    });
  }

  /**
   * バッジの定義と取得
   */
  getBadges(stats) {
    return [
      {
        icon: '🎓',
        name: '初学者',
        description: '最初のレッスンを完了',
        earned: stats.completedLessons >= 1
      },
      {
        icon: '📚',
        name: '勤勉',
        description: '5レッスンを完了',
        earned: stats.completedLessons >= 5
      },
      {
        icon: '🏆',
        name: '達人',
        description: '全レッスンを完了',
        earned: stats.completedLessons === stats.totalLessons && stats.totalLessons > 0
      },
      {
        icon: '🎯',
        name: '正確',
        description: '正答率80%以上',
        earned: stats.accuracy >= 80
      },
      {
        icon: '💯',
        name: '完璧',
        description: '正答率100%',
        earned: stats.accuracy === 100 && stats.totalAttempts > 0
      },
      {
        icon: '🔥',
        name: '熱心',
        description: '50問以上解答',
        earned: stats.totalAttempts >= 50
      },
      {
        icon: '⭐',
        name: '努力家',
        description: '100問以上解答',
        earned: stats.totalAttempts >= 100
      },
      {
        icon: '🚀',
        name: '継続',
        description: '7日間連続学習',
        earned: false // TODO: 実装
      }
    ];
  }

  /**
   * レッスン詳細テーブルの表示
   */
  renderLessonDetails(courseId) {
    const container = document.getElementById('lesson-details');
    if (!container) return;

    const course = this.progress.data.courses[courseId];
    if (!course || Object.keys(course.lessonProgress).length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">まだ学習データがありません</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'details-table';

    // ヘッダー
    table.innerHTML = `
      <thead>
        <tr>
          <th>レッスン</th>
          <th>解答数</th>
          <th>正答数</th>
          <th>正答率</th>
          <th>最終学習</th>
        </tr>
      </thead>
      <tbody id="details-tbody"></tbody>
    `;

    const tbody = table.querySelector('#details-tbody');

    Object.keys(course.lessonProgress).forEach((lessonId, index) => {
      const progress = course.lessonProgress[lessonId];
      const accuracy = this.progress.getLessonAccuracy(courseId, lessonId);
      
      const row = document.createElement('tr');
      
      const lastAttempt = progress.lastAttempt 
        ? new Date(progress.lastAttempt).toLocaleDateString('ja-JP')
        : '-';

      let accuracyClass = 'high';
      if (accuracy < 50) accuracyClass = 'low';
      else if (accuracy < 80) accuracyClass = 'medium';

      row.innerHTML = `
        <td>レッスン ${index + 1}</td>
        <td>${progress.attempts}</td>
        <td>${progress.correctAnswers}</td>
        <td>
          <div class="accuracy-bar">
            <div class="accuracy-fill ${accuracyClass}" style="width: ${accuracy}%"></div>
          </div>
          <span style="font-size: 0.9rem; color: var(--text-light);">${accuracy}%</span>
        </td>
        <td>${lastAttempt}</td>
      `;

      tbody.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(table);
  }

  /**
   * データ情報の表示
   */
  renderDataInfo(stats) {
    const lastStudied = document.getElementById('last-studied');
    const startedAt = document.getElementById('started-at');

    if (lastStudied) {
      lastStudied.textContent = stats.lastStudied 
        ? new Date(stats.lastStudied).toLocaleString('ja-JP')
        : '-';
    }

    if (startedAt) {
      startedAt.textContent = stats.startedAt 
        ? new Date(stats.startedAt).toLocaleString('ja-JP')
        : '-';
    }
  }

  /**
   * 空の状態を表示
   */
  showEmptyState() {
    const container = document.querySelector('.dashboard-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">📊</div>
          <h2>まだ学習データがありません</h2>
          <p style="color: var(--text-light); margin-top: 1rem;">
            レッスンを始めると、ここに統計が表示されます
          </p>
        </div>
      `;
    }
  }
}
