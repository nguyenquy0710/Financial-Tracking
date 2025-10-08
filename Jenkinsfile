#!/usr/bin/env groovy

/**
 * Jenkins Pipeline for FinTrack Project
 * This pipeline includes stages for installing dependencies, linting, building, testing, and deploying.
 * Install Dependencies -> Lint -> Build -> Test -> Deploy -> Cleanup
 * Error handling and cleanup are also included.
 */

node {
  properties([disableConcurrentBuilds()])
  // ansiColor('xterm') // Sử dụng màu sắc trong console output
  // timestamps() // Thêm timestamp vào log
  // timeout(time: 30, unit: 'MINUTES')

  environment {
    NODE_ENV = 'production'
  }

  try {
    path = "/u02/financial-tracking"
    source = "/u02/financial-tracking"
    destination = "/u02/financial-tracking-docker"
    remoteHost = "jenkins@192.168.1.27"

    stage('Workspace Clearing') {
      cleanWs()
    }

    stage('checkout code') {
      checkout scm
      sh "git checkout ${env.BRANCH_NAME} && git reset --hard origin/${env.BRANCH_NAME}"
    }

    stage('Install Dependencies') {
      echo '🔧 Installing dependencies...'
      sh 'npm install'
    }

    stage('Lint') {
      echo '🔍 Running ESLint...'
      sh 'npm run lint'
    }

    stage('Build') {
      echo '🔨 Building...'
      // Nếu có bước build (ví dụ Babel, TypeScript), thêm vào đây
      // Với Node.js thường không cần build nếu code là JavaScript thuần
    }

    stage('Test') {
      echo '🔍 Running tests...'
      def testStatus = sh(script: 'npm test', returnStatus: true)
      if (testStatus != 0) {
          error('❌ Tests failed!')
      }
    }

    stage('Deploy') {
      echo '🚀 Deploying...'
      // Tuỳ vào môi trường, bạn có thể chạy lệnh deploy ở đây, ví dụ:
      // sh './scripts/deploy.sh' (nếu bạn có file script triển khai)
    }

    sshagent(['jenkins-ssh']) {
      stage('remove old code') {
        sh """
          ssh -o StrictHostKeyChecking=no ${remoteHost} 'cd ${path} && sudo rm -rf ./{,.[!.],..?}*'
        """
      }
    }
  }
  catch (exception) {
    stage('Error') {
      echo "❌ Error occurred: ${exception.message}"
    }

    currentBuild.result = "FAILED"
    throw exception
  }
  finally {
    stage('Cleanup') {
      echo '🧹 Cleaning up...'
      // Ví dụ: xóa file tạm, logs, etc.
    }
  }
}
