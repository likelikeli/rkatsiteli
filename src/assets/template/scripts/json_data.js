function dataHave(dataNode,dataEdge) {
    dataNode.filter((item,index)=>{
        let yy =0
        dataNode.filter((item1,index1)=>{
            if(JSON.stringify(item.position)==JSON.stringify(item1.position)&&item1.nameS){
                item.nameS = item1.nameS
            }else if(JSON.stringify(item.position)==JSON.stringify(item1.position)&&item.nameS){
                item1.nameS = item.nameS
            }
            if(JSON.stringify(item)==JSON.stringify(item1)){
                yy++
            }
        })
        if(yy>1){
            dataNode.splice(index,1)
        }
    })

    let idArr=[]
    let pidArr=[]
    dataEdge.filter((edge)=>{
        idArr.push(edge.id)
        pidArr.push(edge.pid)
    })
    let leafArr=[]
    idArr.filter(id=>{
        let noHave=true
        pidArr.filter(pid=>{
            if(pid==id){
                noHave=false
            }
        })
        if(noHave){
            let name=''
            let position=''
            let nameS=''
            dataNode.forEach(item=>{
                if(item.id==id){
                    name=item.name
                    position=item.position.join(',')
                    if(item.nameS){
                        nameS=item.nameS
                    }

                }
            })
            let lis={id:id,name:name,position:position}
            lis.nameS=nameS
            leafArr.push(lis)
        }
    })
    demo()
    function demo(){
        let idAll=[]
        let idAll1=[]
        leafArr.filter((item,index)=>{
            let ccc=1
            idAll.filter(it=>{
                if(item.id==it.id){
                    ccc++
                }
            })
            idAll1.push(item.id)
            idAll.push({id:item.id,index:ccc})
        })
        let isLoop=true
        let isHave=false
        leafArr.filter((item,index)=>{
            let count=0
            idAll1.filter(ttId=>{
                if(ttId==item.id){
                    count++
                }
            })
            if(count>1){
                let coun=0
                let name=''
                let position=''
                let pid=''
                dataEdge.filter(edge=>{
                    if(edge.id==item.id){
                        coun++
                        if(coun==idAll[index].index){
                            pid=edge.pid
                            dataNode.forEach(val=>{
                                if(val.id==edge.pid&&val.targetId){
                                    name=val.name
                                    position=val.position.join(',')
                                }
                            })
                        }
                        if(!pid){
                            pid=edge.pid
                            dataNode.forEach(val=>{
                                if(val.id==edge.pid&&val.targetId) {
                                    name = val.name
                                    position = val.position.join(',')
                                }
                            })
                        }
                    }
                })
                if(pid){
                    item.name=name+'_'+item.name
                    item.position=position+'_'+item.position
                    item.pid=pid
                }
                isLoop=true
            }else if(count==1){
                let name=''
                let position=''
                let pid=''
                dataEdge.filter(edge=>{
                    if(edge.id==item.id){
                        pid=edge.pid
                        dataNode.forEach(val=>{
                            if(val.id==edge.pid){
                                name=val.name
                                position=val.position.join(',')
                            }
                        })
                    }
                })
                if(pid){
                    item.name=name+'_'+item.name
                    item.position=position+'_'+item.position
                    item.pid=pid
                }
                isLoop=true
            }else{
                isLoop=false
            }
        })
        leafArr.filter(item=>{
            item.id=item.pid
        })
        leafArr.filter(item=>{
            dataEdge.filter(edge=>{
                if(item.id==edge.id&& isLoop){
                    isHave=true
                }
            })
        })
        if(isLoop&&isHave){
            demo()
        }
    }
    return leafArr
}
