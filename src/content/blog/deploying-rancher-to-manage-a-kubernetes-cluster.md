---
title: 'Deploying Rancher to manage a Kubernetes cluster' 
description: 'Now that we have a cluster up and running (see part 1
[https://benyoung.blog/setting-up-a-kubernetes-cluster-with-k3s-and-k3os-via-cloud-init/]
) and '
heroImage: '/content/images/2021/07/deploy-rancher.png'
slug: 'deploying-rancher-to-manage-a-kubernetes-cluster'
pubDate: '2021-07-09T03:52:11.000Z'
tags: ["kubernetes"] 
categories: ['Infrastructure']
author: ["ben"]
---

Now that we have a cluster up and running ([see part 1](https://benyoung.blog/setting-up-a-kubernetes-cluster-with-k3s-and-k3os-via-cloud-init/)) and some persistent NFS storage ([part 2](https://benyoung.blog/persistent-storage-class-in-kubernetes-backed-by-synology-nfs/)) it is time to deploy Rancher so I have a nice management interface for the cluster.

## Pre-requisites 

### Certmanager

First off we need to add certmanager to our cluster, unless you are bringing your own certificates via files (not covered here). But if you are wanting to use LetsEncrypt or Rancher generated this is needed. 

Install the CRDs for cert manager

```
    kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.0.4/cert-manager.crds.yaml
```
    
Create the namespace

```
kubectl create namespace cert-manager

```

Now add the jetstack helm repo and do an update

```
helm repo add jetstack https://charts.jetstack.io
helm repo update

```

Now install cert-manager

```
helm install \
cert-manager jetstack/cert-manager \
--namespace cert-manager \
--version v1.0.4
```

Now you can verify the install an you should see something similar to the following.

```
kubectl get pods --namespace cert-manager
```

![](/content/images/2021/07/image-2.png)
### Cattle-system namespace

We also need to create a namespace on the cluster for Rancher to be provisioned into. This can be what you like but I went with the default cattle-system namespace.

Run the following command

```
kubectl create namespace cattle-system

```

### Installing Rancher

Now the perquisites are installed on to the main course.

You have a few options when installing

- Hostname you want Rancher to be listening on
- Replicas, up to you depending how many nodes etc you have
- Namespace == the namespace you created earlier
- If you are wanting to use LetsEncrypt youll need to also set the --set ingress.tls.source=letsEncrypt \ --set [letsEncrypt.email=me@example.org](letsEncrypt.email=me@example.org) options too. 


Run this command to install rancher

```
helm install rancher rancher-latest/rancher \
--namespace cattle-system \
--set hostname=rancher.mp2.nz \
--set replicas=3
```

Now monitor the rollout with 

```
kubectl -n cattle-system rollout status deploy/rancher
```

Once complete you will see "rancher" has been successfully rolled out,
![](/content/images/2021/07/image-3.png)
Onto configuring the Rancher, open up https://{yourhostname} in a browser and you will be greeted with the setup wizard. Enter your details and select continue.
![](/content/images/2021/07/image-4.png)
You will now be presented with the cluster manger and selecting the nodes menu option you can see your nodes are visible.
![](/content/images/2021/07/image-5.png)
Under storage if you select Storage Classes you can see the NFS provisioner we created in the previous blog.
![](/content/images/2021/07/image-7.png)
There is a new Cluster Explorer available too, to get to this select Cluster Explorer top right in the Manager 
![](/content/images/2021/07/image-8.png)
Then you will see more node information etc as well as a tonne more options including the ability to browser helm charts and install apps via the browser. Click on the little menu top left and select Apps and Marketplace. 

By default it only comes installed with the Rancher and Rancher Partners chart repository so the apps are limited,  but you can easily add more. Let's add Bitnami.

Select Chart Repositories on the left and you can see the repositories that have been installed already.
![](/content/images/2021/07/image-9.png)
Click on Create and we want to enter in  the target https://charts.bitnami.com/bitnami , not auth is required and the rest of the options are up to you.
![](/content/images/2021/07/image-10.png)
The Cluster Explorer will now scan this repository and become active once this is complete.
![](/content/images/2021/07/image-11.png)
Clicking back on charts you can now see there are a tonne more charts ready to be installed!
![](/content/images/2021/07/image-12.png)
Let's do a classic hello-world and install the Nginx chart. Search for it in the list, I added in ingress.hostname of nginx-test.mp2.nz  and enabled the ingress/certmanger.

Wait for it to deploy and you will then see an ingress under the Cluster Explorer (Service Discovery>Ingresses) pointing at your nginx service.
![](/content/images/2021/07/image-13.png)
Provided you have the DNS setup, hit it in a browser;
![](/content/images/2021/07/image-14.png)
Neat, now we can go deploy some proper workload!

### What next?

In a followup post I will show you how to

- **Backup workloads** using Veeam's Kasten suite


You can view the *previous items* in the series here

- Setting up the [Kubernetes cluster with k3os, k3s and cloud-init](https://benyoung.blog/setting-up-a-kubernetes-cluster-with-k3s-and-k3os-via-cloud-init/)
- Provisioning a [Persistent storage class by Synology NFS](https://benyoung.blog/persistent-storage-class-in-kubernetes-backed-by-synology-nfs/)
                                
                                
                            
                            
                        
                        
                    
                    
                
                
            
            
        
        
    
    

