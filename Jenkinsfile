pipeline {
    agent any

    environment {
        DOCKERHUB_USER   = 'kartavyanirwel'
        BACKEND_IMAGE    = "${DOCKERHUB_USER}/devhub-backend"
        FRONTEND_IMAGE   = "${DOCKERHUB_USER}/devhub-frontend"
        IMAGE_TAG        = "${env.BUILD_NUMBER}"

        DOCKERHUB_CREDS  = credentials('dockerhub-creds')   // Jenkins credential ID: Username + Password/Token
        KUBECONFIG_CRED  = 'kubeconfig-eks'                 // Jenkins credential ID: Secret file (kubeconfig)

        K8S_NAMESPACE    = 'devhub'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                }
            }
        }

        stage('Trivy Scan - Backend') {
            steps {
                sh """
                    trivy image --severity HIGH,CRITICAL --exit-code 0 \
                        --format table -o trivy-backend-report.txt \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                """
                // exit-code 0 = report only, doesn't fail the build.
                // Change to --exit-code 1 once you want the pipeline to
                // actually block on CRITICAL vulnerabilities.
            }
        }

        stage('Trivy Scan - Frontend') {
            steps {
                sh """
                    trivy image --severity HIGH,CRITICAL --exit-code 0 \
                        --format table -o trivy-frontend-report.txt \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh """
                    echo "${DOCKERHUB_CREDS_PSW}" | docker login -u "${DOCKERHUB_CREDS_USR}" --password-stdin
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: "${KUBECONFIG_CRED}", variable: 'KUBECONFIG_FILE')]) {
                    sh """
                        export KUBECONFIG=\$KUBECONFIG_FILE
                        kubectl apply -f k8s/manifests/01-namespace-secret.yaml --validate=false
                        kubectl apply -f k8s/manifests/02-mysql.yaml --validate=false
                        kubectl apply -f k8s/manifests/03-backend-frontend.yaml --validate=false
                        kubectl apply -f k8s/manifests/04-networkpolicy.yaml --validate=false

                        kubectl set image deployment/devhub-backend backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n ${K8S_NAMESPACE}
                        kubectl set image deployment/devhub-frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n ${K8S_NAMESPACE}

                        kubectl rollout status deployment/devhub-backend -n ${K8S_NAMESPACE} --timeout=180s
                        kubectl rollout status deployment/devhub-frontend -n ${K8S_NAMESPACE} --timeout=180s
                    """
                }
            }
        }

        stage('Verify') {
            steps {
                withCredentials([file(credentialsId: "${KUBECONFIG_CRED}", variable: 'KUBECONFIG_FILE')]) {
                    sh """
                        export KUBECONFIG=\$KUBECONFIG_FILE
                        kubectl get pods -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ DevHub 2.0 built, scanned, pushed, and deployed - build #${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline failed - check stage logs above"
        }
        always {
            archiveArtifacts artifacts: 'trivy-*-report.txt', allowEmptyArchive: true
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
