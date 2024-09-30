---
title: 'Removing Rancher from a cluster' 
description: 'As I have been playing around with a few Kubernetes products i have been needing
to remove these as I go along. If you need to delete rancher from you'
heroImage: 'https://images.unsplash.com/photo-1604858960757-4985eccff45f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDI5fHx0cmFzaHxlbnwwfHx8fDE2MjU0NTk3ODE&ixlib=rb-1.2.1&q=80&w=1080'
slug: 'removing-rancher-from-a-cluster'
pubDate: '2021-07-05T04:36:53.000Z'
tags: ["kubernetes"] 
categories: ['veeam']
author: ["ben"]
---

As I have been playing around with a few Kubernetes products i have been needing to remove these as I go along. If you need to delete rancher from your cluster here is how you go about it.

1. Grab the latest release of the Rancher system tools, *I grabbed the linux-amd-64 version*[https://github.com/rancher/system-tools/releases](https://github.com/rancher/system-tools/releases)
2. You will need your Kubeconfig file, I already have my loaded on a jump host i use for managing this cluster

Now from the command line run the following;

```
    ./system-tools_linux-amd64 remove --kubeconfig ~/.kube/config
```

When asked, select Y to the removal of the control plane in cattle-system (or something else if you have a custom namespace set)

> there are a few options just check out the system-tools git repository for more or the [Rancher docs](https://rancher.com/docs/rancher/v2.5/en/system-tools/#remove).


It will now go through and remove all items in the cluster relating to the deployment such as accounts, roles, resources etc etc 
![](/content/images/2021/07/image-1.png)
This will run for a while and then it will end with messages saying it is now complete.
![](/content/images/2021/07/image.png)

